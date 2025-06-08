'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Disease, getDiseasesByDomain } from '@/app/lib/api/disease';
import { Domain, getDomains } from '@/app/lib/api/domain';
import { 
  Crossmap, 
  CrossmapResponse, 
  CrossmapOneToMany, 
  SourceDisease,
  getCrossmapsBetweenDomains, 
  updateStandardCrossmaps, 
  importCrossmaps 
} from '@/app/lib/api/crossmap';
import { toast } from 'react-hot-toast';

// Custom component kết hợp search và select
function SearchableSelect({ 
  options, 
  onSelect, 
  placeholder = "Tìm kiếm...",
  emptyMessage = "Không có dữ liệu"
}: { 
  options: { id: string; label: string }[]; 
  onSelect: (id: string) => void; 
  placeholder?: string;
  emptyMessage?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchText 
    ? options.filter(option => option.label.toLowerCase().includes(searchText.toLowerCase()))
    : options;

  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (id: string) => {
    onSelect(id);
    setSearchText('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="block w-full p-2 pr-10 text-gray-800 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        <button 
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
        >
          {searchText ? (
            <svg 
              onClick={(e) => {
                e.stopPropagation();
                setSearchText('');
              }} 
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
          <div className="py-1 text-sm text-gray-700">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleOptionClick(option.id)}
                >
                  <span>{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">{emptyMessage}</div>
            )}
          </div>
          <div className="px-4 py-2 text-xs text-gray-500 border-t">
            Hiển thị {filteredOptions.length} / {options.length} bệnh
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrossmapsManagement() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [standardDomain, setStandardDomain] = useState<Domain | null>(null);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [domainDiseases, setDomainDiseases] = useState<Disease[]>([]);
  const [standardDiseases, setStandardDiseases] = useState<Disease[]>([]);
  const [crossmapResponse, setCrossmapResponse] = useState<CrossmapResponse | null>(null);
  const [mappings, setMappings] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  // Fetch domains first
  useEffect(() => {
    const fetchDomains = async () => {
      if (!token) return;
      
      try {
        const response = await getDomains(token, 0, 100); // Get all domains
        setDomains(response.items);
        
        // Find STANDARD domain
        const standardDomainObj = response.items.find(domain => domain.domain === 'STANDARD');
        if (standardDomainObj) {
          setStandardDomain(standardDomainObj);
          
          // Set first non-standard domain as active by default
          const firstNonStandardDomain = response.items.find(domain => domain.domain !== 'STANDARD');
          if (firstNonStandardDomain) {
            setActiveDomainId(firstNonStandardDomain.id);
          }
        }
      } catch (err) {
        setError((err as Error).message || 'Không thể tải danh sách domain');
        console.error('Error fetching domains:', err);
      }
    };
    
    if (token) {
      fetchDomains();
    }
  }, [token]);

  // Fetch standard diseases when standard domain is identified
  useEffect(() => {
    const fetchStandardDiseases = async () => {
      if (!token || !standardDomain) return;
      
      try {
        setIsLoading(true);
        const response = await getDiseasesByDomain(standardDomain.id, 0, 1000, token, false);
        setStandardDiseases(response.items);
      } catch (err) {
        setError((err as Error).message || 'Không thể tải danh sách bệnh tiêu chuẩn');
        console.error('Error fetching standard diseases:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (standardDomain) {
      fetchStandardDiseases();
    }
  }, [token, standardDomain]);

  // Fetch domain diseases and crossmaps when active domain changes
  useEffect(() => {
    const fetchDomainData = async () => {
      if (!token || !activeDomainId || !standardDomain) return;
      
      try {
        setIsLoading(true);
        // Don't fetch if STANDARD domain is selected
        if (activeDomainId === standardDomain.id) {
          setDomainDiseases([]);
          setCrossmapResponse(null);
          setMappings({});
          return;
        }

        // Fetch diseases for the active domain
        const diseasesResponse = await getDiseasesByDomain(activeDomainId, 0, 1000, token, false);
        setDomainDiseases(diseasesResponse.items);

        // Fetch crossmaps between active domain and STANDARD domain
        const response = await getCrossmapsBetweenDomains(activeDomainId, standardDomain.id, token);
        setCrossmapResponse(response);

        // Khởi tạo mappings dựa trên dữ liệu crossmaps mới
        const initialMappings: Record<string, string[]> = {};
        
        // Duyệt qua tất cả các bệnh trong domain nguồn
        diseasesResponse.items.forEach(disease => {
          initialMappings[disease.id] = [];
        });
        
        // Cập nhật mappings từ dữ liệu crossmap
        if (response && response.crossmaps) {
          response.crossmaps.forEach((crossmap: CrossmapOneToMany) => {
            crossmap.source_diseases.forEach(sourceDisease => {
              if (!initialMappings[sourceDisease.source_disease_id]) {
                initialMappings[sourceDisease.source_disease_id] = [];
              }
              
              // Thêm target disease vào danh sách ánh xạ của source disease
              initialMappings[sourceDisease.source_disease_id].push(crossmap.target_disease_id);
            });
          });
        }
        
        setMappings(initialMappings);
        
        // Khởi tạo searchQueries cho mỗi bệnh
        const initialSearchQueries: Record<string, string> = {};
        diseasesResponse.items.forEach(disease => {
          initialSearchQueries[disease.id] = '';
        });
        setSearchQueries(initialSearchQueries);
      } catch (err) {
        setError((err as Error).message || 'Không thể tải dữ liệu ánh xạ');
        console.error('Error fetching domain data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeDomainId && standardDomain) {
      fetchDomainData();
    }
  }, [token, activeDomainId, standardDomain]);

  const handleDomainChange = (domainId: string) => {
    setActiveDomainId(domainId);
  };

  const handleMappingChange = (domainDiseaseId: string, standardDiseaseId: string) => {
    // Tạo bản sao mới của state mappings để đảm bảo React nhận biết thay đổi
    const updatedMappings = { ...mappings };
    
    // Nếu chọn "Không ánh xạ", xóa tất cả ánh xạ hiện tại
    if (standardDiseaseId === '') {
      updatedMappings[domainDiseaseId] = [];
    } 
    // Nếu đã có ánh xạ này, xóa nó khỏi danh sách
    else if (updatedMappings[domainDiseaseId]?.includes(standardDiseaseId)) {
      updatedMappings[domainDiseaseId] = updatedMappings[domainDiseaseId].filter(id => id !== standardDiseaseId);
    } 
    // Nếu chưa có ánh xạ này, thêm vào danh sách
    else {
      if (!updatedMappings[domainDiseaseId]) {
        updatedMappings[domainDiseaseId] = [];
      }
      updatedMappings[domainDiseaseId].push(standardDiseaseId);
    }
    
    // Cập nhật state một cách đồng bộ
    setMappings(updatedMappings);
    
    // Reset search query sau khi chọn
    setSearchQueries(prev => ({
      ...prev,
      [domainDiseaseId]: ''
    }));

    // Log để kiểm tra giá trị
    console.log("Đã cập nhật ánh xạ:", domainDiseaseId, standardDiseaseId, updatedMappings[domainDiseaseId]);
  };

  // Xử lý thay đổi tìm kiếm
  const handleSearchChange = (domainDiseaseId: string, searchText: string) => {
    setSearchQueries(prev => ({
      ...prev,
      [domainDiseaseId]: searchText
    }));
  };

  // Lọc bệnh tiêu chuẩn dựa trên tìm kiếm
  const getFilteredStandardDiseases = (domainDiseaseId: string) => {
    const searchText = searchQueries[domainDiseaseId]?.toLowerCase() || '';
    if (!searchText) return standardDiseases;
    
    return standardDiseases.filter(disease => 
      disease.label.toLowerCase().includes(searchText)
    );
  };

  const handleSaveMappings = async () => {
    if (!token || !activeDomainId || !standardDomain) return;
    
    try {
      setIsSaving(true);
      
      // Chuyển đổi mappings từ dạng 1:n sang danh sách ánh xạ 1:1 để phù hợp với API
      const crossmapsData: {
        standard_disease_id: string;
        target_disease_id: string;
      }[] = [];

      Object.entries(mappings).forEach(([sourceDiseaseId, targetDiseaseIds]) => {
        targetDiseaseIds.forEach(targetDiseaseId => {
          crossmapsData.push({
            standard_disease_id: targetDiseaseId,
            target_disease_id: sourceDiseaseId
          });
        });
      });
      
      const updateData = {
        target_domain_id: activeDomainId,
        crossmaps_lite: crossmapsData
      };
      
      await updateStandardCrossmaps(token, updateData);
      toast.success('Cập nhật ánh xạ thành công');
      
      // Refresh crossmaps
      const response = await getCrossmapsBetweenDomains(activeDomainId, standardDomain.id, token);
      setCrossmapResponse(response);
    } catch (err) {
      setError((err as Error).message || 'Lỗi khi cập nhật ánh xạ');
      toast.error('Lỗi khi cập nhật ánh xạ');
      console.error('Error saving mappings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token || !activeDomainId) return;

    // Get current domain name
    const currentDomain = domains.find(d => d.id === activeDomainId);
    if (!currentDomain) return;

    try {
      setIsImporting(true);
      
      // Read JSON file
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      
      // Validate JSON structure - file content should be an object with disease mappings
      if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
        throw new Error('File JSON không hợp lệ: phải là object chứa ánh xạ bệnh');
      }

      // Prepare import data - use entire JSON content as mappings
      const importData = {
        mappings: jsonData,
        target_domain_name: currentDomain.domain
      };

      // Call import API
      await importCrossmaps(token, importData);
      toast.success('Import ánh xạ thành công');

      // Refresh data
      if (standardDomain) {
        const response = await getCrossmapsBetweenDomains(activeDomainId, standardDomain.id, token);
        setCrossmapResponse(response);
        
        // Cập nhật trạng thái mappings từ dữ liệu mới
        const newMappings: Record<string, string[]> = {};
        
        // Khởi tạo mappings trống cho tất cả bệnh trong domain
        domainDiseases.forEach(disease => {
          newMappings[disease.id] = [];
        });
        
        // Cập nhật từ dữ liệu crossmap
        if (response && response.crossmaps) {
          response.crossmaps.forEach((crossmap: CrossmapOneToMany) => {
            crossmap.source_diseases.forEach(sourceDisease => {
              if (!newMappings[sourceDisease.source_disease_id]) {
                newMappings[sourceDisease.source_disease_id] = [];
              }
              newMappings[sourceDisease.source_disease_id].push(crossmap.target_disease_id);
            });
          });
        }
        
        setMappings(newMappings);
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Lỗi khi import ánh xạ';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error importing mappings:', err);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle export mappings
  const handleExportMappings = () => {
    if (!activeDomainId || domainDiseases.length === 0 || !crossmapResponse) return;

    // Get current domain name
    const currentDomain = domains.find(d => d.id === activeDomainId);
    if (!currentDomain) return;

    // Create export data - cho định dạng 1:n
    const exportData: Record<string, string[]> = {};
    
    domainDiseases.forEach(disease => {
      const standardDiseaseIds = mappings[disease.id] || [];
      if (standardDiseaseIds.length > 0) {
        const standardDiseaseLabels: string[] = [];
        
        standardDiseaseIds.forEach(stdId => {
          const stdDisease = standardDiseases.find(std => std.id === stdId);
          if (stdDisease) {
            standardDiseaseLabels.push(stdDisease.label);
          }
        });
        
        if (standardDiseaseLabels.length > 0) {
          exportData[disease.label] = standardDiseaseLabels;
        }
      }
    });

    // Create and download JSON file
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `crossmap_${currentDomain.domain}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Xuất ánh xạ thành công');
  };

  // Get mapped standard diseases for a domain disease
  const getMappedStandardDiseases = (domainDiseaseId: string): { id: string; label: string }[] => {
    const standardDiseaseIds = mappings[domainDiseaseId] || [];
    if (standardDiseaseIds.length === 0) return [];
    
    return standardDiseaseIds.map(stdId => {
      // Tìm thông tin về bệnh tiêu chuẩn từ dữ liệu crossmap
      if (crossmapResponse && crossmapResponse.crossmaps) {
        const crossmap = crossmapResponse.crossmaps.find(c => c.target_disease_id === stdId);
        if (crossmap) {
          return {
            id: crossmap.target_disease_id,
            label: crossmap.target_disease_label
          };
        }
      }
      
      // Fallback: tìm trong danh sách bệnh tiêu chuẩn
      const stdDisease = standardDiseases.find(d => d.id === stdId);
      return stdDisease 
        ? { id: stdDisease.id, label: stdDisease.label } 
        : { id: stdId, label: 'Không xác định' };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-gray-700 font-bold">Quản lý Ánh xạ Chẩn đoán</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Domain Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          {domains.filter(domain => domain.domain !== 'STANDARD').map(domain => (
            <li key={domain.id} className="mr-2">
              <button
                onClick={() => handleDomainChange(domain.id)}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeDomainId === domain.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 rounded-t-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                }`}
              >
                {domain.domain}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Đang tải...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Ánh xạ với Domain STANDARD</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleImportClick}
                    disabled={isImporting || !activeDomainId}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                      isImporting || !activeDomainId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isImporting ? 'Đang tải...' : `Tải ánh xạ ${domains.find(d => d.id === activeDomainId)?.domain || ''}`}
                  </button>
                  <button
                    onClick={handleExportMappings}
                    disabled={!activeDomainId || domainDiseases.length === 0}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                      !activeDomainId || domainDiseases.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Lưu ánh xạ {domains.find(d => d.id === activeDomainId)?.domain || ''}
                  </button>
                  <button
                    onClick={handleSaveMappings}
                    disabled={isSaving}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
                      isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu ánh xạ'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Chọn bệnh từ domain STANDARD để ánh xạ với bệnh trong domain hiện tại. Mỗi bệnh có thể ánh xạ tới nhiều bệnh tiêu chuẩn.
              </p>
            </div>
            
            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Bệnh trong Domain hiện tại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ánh xạ với bệnh trong Domain STANDARD
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domainDiseases.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-700">
                      {domains.length > 0 && activeDomainId 
                        ? `Không tìm thấy bệnh nào thuộc domain ${domains.find(d => d.id === activeDomainId)?.domain || ''}`
                        : 'Không tìm thấy bệnh nào'}
                    </td>
                  </tr>
                ) : (
                  domainDiseases.map((disease) => (
                    <tr key={disease.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{disease.label}</div>
                        {disease.description && (
                          <div className="text-sm text-gray-700 truncate max-w-xs">
                            {disease.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="mb-2">
                          {/* Thay thế search box và select box bằng SearchableSelect */}
                          <SearchableSelect
                            options={standardDiseases}
                            onSelect={(id) => handleMappingChange(disease.id, id)}
                            placeholder="Tìm và chọn bệnh tiêu chuẩn để thêm ánh xạ..."
                            emptyMessage="Không tìm thấy bệnh phù hợp"
                          />
                        </div>
                        
                        {/* Hiển thị danh sách các bệnh đã được ánh xạ */}
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Các ánh xạ hiện tại: 
                            <span className="ml-1 font-normal text-gray-500">
                              ({(mappings[disease.id] || []).length} bệnh)
                            </span>
                          </h4>
                          {(mappings[disease.id] || []).length > 0 ? (
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                              {getMappedStandardDiseases(disease.id).map(stdDisease => (
                                <li key={stdDisease.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50">
                                  <button
                                    onClick={() => handleMappingChange(disease.id, stdDisease.id)}
                                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                                    title="Xóa ánh xạ này"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  <span className="text-sm text-gray-800 break-words">{stdDisease.label}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-amber-600 py-1">
                              Chưa có ánh xạ
                            </div>
                          )}
                        </div>
                        
                        {/* Nút xóa tất cả ánh xạ của bệnh này */}
                        {(mappings[disease.id] || []).length > 0 && (
                          <button
                            onClick={() => handleMappingChange(disease.id, '')}
                            className="mt-2 px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50"
                          >
                            Xóa tất cả ánh xạ
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 