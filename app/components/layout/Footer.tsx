import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold text-blue-700">DermaAI</h2>
            <p className="mt-2 text-sm">
              Hệ thống hỗ trợ thông tin và chẩn đoán về bệnh da liễu
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Liên kết</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-sm hover:text-blue-600">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/diseases" className="text-sm hover:text-blue-600">
                    Bệnh da liễu
                  </Link>
                </li>
                <li>
                  <Link href="/diagnosis" className="text-sm hover:text-blue-600">
                    Chẩn đoán
                  </Link>
                </li>
                <li>
                  <Link href="/clinics" className="text-sm hover:text-blue-600">
                    Phòng khám
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Thông tin thêm</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#" className="text-sm hover:text-blue-600">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-blue-600">
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-blue-600">
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} DermaAI. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 