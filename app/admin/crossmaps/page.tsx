'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Disease, getDiseasesByDomain } from '@/app/lib/api/disease';
import { Domain, getDomains } from '@/app/lib/api/domain';
import { Crossmap, getCrossmapsBetweenDomains, updateStandardCrossmaps, importCrossmaps } from '@/app/lib/api/crossmap';
import { toast } from 'react-hot-toast';

export default function CrossmapsManagement() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [standardDomain, setStandardDomain] = useState<Domain | null>(null);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [domainDiseases, setDomainDiseases] = useState<Disease[]>([]);
  const [standardDiseases, setStandardDiseases] = useState<Disease[]>([]);
  const [crossmaps, setCrossmaps] = useState<Crossmap[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setCrossmaps([]);
          setMappings({});
          return;
        }

        // Fetch diseases for the active domain
        const diseasesResponse = await getDiseasesByDomain(activeDomainId, 0, 1000, token, false);
        setDomainDiseases(diseasesResponse.items);

        // Fetch crossmaps between active domain and STANDARD domain
        const crossmapsResponse = await getCrossmapsBetweenDomains(activeDomainId, standardDomain.id, token);
        setCrossmaps(crossmapsResponse);

        // Initialize mappings based on crossmaps
        const initialMappings: Record<string, string> = {};
        crossmapsResponse.forEach(crossmap => {
          // In the new format, source_disease_id is from the current domain and target_disease_id is from the STANDARD domain
          initialMappings[crossmap.source_disease_id] = crossmap.target_disease_id;
        });
        setMappings(initialMappings);
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
    setMappings(prev => {
      const updated = { ...prev };
      
      // If empty string is selected, remove the mapping entirely
      if (standardDiseaseId === '') {
        delete updated[domainDiseaseId];
      } else {
        updated[domainDiseaseId] = standardDiseaseId;
      }
      
      return updated;
    });
  };

  const handleSaveMappings = async () => {
    if (!token || !activeDomainId || !standardDomain) return;
    
    try {
      setIsSaving(true);
      
      // Only include diseases that have a mapping
      const crossmapsData = Object.entries(mappings)
        .filter(([_, standardDiseaseId]) => standardDiseaseId) // Only include non-empty mappings
        .map(([targetDiseaseId, standardDiseaseId]) => ({
          standard_disease_id: standardDiseaseId,
          target_disease_id: targetDiseaseId
        }));
      
      const updateData = {
        target_domain_id: activeDomainId,
        crossmaps_lite: crossmapsData
      };
      
      await updateStandardCrossmaps(token, updateData);
      toast.success('Cập nhật ánh xạ thành công');
      
      // Refresh crossmaps
      const crossmapsResponse = await getCrossmapsBetweenDomains(activeDomainId, standardDomain.id, token);
      setCrossmaps(crossmapsResponse);
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
        const crossmapsResponse = await getCrossmapsBetweenDomains(activeDomainId, standardDomain.id, token);
        setCrossmaps(crossmapsResponse);
        
        // Update mappings state
        const newMappings: Record<string, string> = {};
        crossmapsResponse.forEach(crossmap => {
          newMappings[crossmap.source_disease_id] = crossmap.target_disease_id;
        });
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
    if (!activeDomainId || domainDiseases.length === 0) return;

    // Get current domain name
    const currentDomain = domains.find(d => d.id === activeDomainId);
    if (!currentDomain) return;

    // Create export data
    const exportData: Record<string, string> = {};
    
    domainDiseases.forEach(disease => {
      const standardDiseaseId = mappings[disease.id];
      if (standardDiseaseId) {
        const standardDisease = standardDiseases.find(std => std.id === standardDiseaseId);
        if (standardDisease) {
          exportData[disease.label] = standardDisease.label;
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

  // Get mapped standard disease for a domain disease
  const getMappedStandardDisease = (domainDiseaseId: string): { id: string; label: string } | undefined => {
    const standardDiseaseId = mappings[domainDiseaseId];
    if (!standardDiseaseId) return undefined;
    
    // Find from crossmaps first (has the labels)
    const crossmap = crossmaps.find(c => c.source_disease_id === domainDiseaseId);
    if (crossmap) {
      return {
        id: crossmap.target_disease_id,
        label: crossmap.target_disease_label
      };
    }
    
    // Fallback to finding in standardDiseases if not found in crossmaps
    const stdDisease = standardDiseases.find(d => d.id === standardDiseaseId);
    return stdDisease ? { id: stdDisease.id, label: stdDisease.label } : undefined;
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
                Chọn bệnh từ domain STANDARD để ánh xạ với bệnh trong domain hiện tại
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
                        <select
                          value={mappings[disease.id] || ''}
                          onChange={(e) => handleMappingChange(disease.id, e.target.value)}
                          className="block w-full p-2 text-gray-800 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">-- Không ánh xạ (bỏ ánh xạ) --</option>
                          {standardDiseases.map((stdDisease) => (
                            <option key={stdDisease.id} value={stdDisease.id}>
                              {stdDisease.label}
                            </option>
                          ))}
                        </select>
                        {getMappedStandardDisease(disease.id) ? (
                          <div className="mt-1 text-sm text-gray-600">
                            Ánh xạ hiện tại: {getMappedStandardDisease(disease.id)?.label}
                          </div>
                        ) : (
                          <div className="mt-1 text-sm text-amber-600">
                            Chưa có ánh xạ
                          </div>
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