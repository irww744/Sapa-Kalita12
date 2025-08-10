import React, { useState } from 'react';
import { Search, QrCode, Download, Copy, X, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface Warga {
  id: number;
  nama: string;
  alamat: string;
  nominalTagihan: number;
}

interface QRModalData {
  warga: Warga;
  transactionId: string;
  payload: string;
  qrCodeDataUrl: string;
}

const DaftarTagihan: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarga, setSelectedWarga] = useState<QRModalData | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Data warga dummy - mudah diubah untuk mengambil dari server
  const dataWarga: Warga[] = [
    {
      id: 1,
      nama: 'Budi Santoso',
      alamat: 'Jl. Kalita Blok A No. 15',
      nominalTagihan: 175000
    },
    {
      id: 2,
      nama: 'Siti Nurhaliza',
      alamat: 'Jl. Kalita Blok B No. 8',
      nominalTagihan: 175000
    },
    {
      id: 3,
      nama: 'Ahmad Wijaya',
      alamat: 'Jl. Kalita Blok C No. 22',
      nominalTagihan: 175000
    },
    {
      id: 4,
      nama: 'Rina Marlina',
      alamat: 'Jl. Kalita Blok A No. 7',
      nominalTagihan: 175000
    },
    {
      id: 5,
      nama: 'Dedi Kurniawan',
      alamat: 'Jl. Kalita Blok D No. 12',
      nominalTagihan: 175000
    }
  ];

  // Fungsi untuk membuat payload demo - akan diganti dengan server-side
  const makeDemoPayload = (warga: Warga, transactionId: string): string => {
    const payload = {
      merchant_id: "CLUSTER_KALITA_001",
      transaction_id: transactionId,
      amount: warga.nominalTagihan,
      currency: "IDR",
      description: `Iuran RT/RW - ${warga.nama}`,
      customer_name: warga.nama,
      customer_address: warga.alamat,
      timestamp: new Date().toISOString(),
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 jam
    };
    
    return JSON.stringify(payload, null, 2);
  };

  // Generate transaction ID
  const generateTransactionId = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  // Generate QR Code
  const generateQRCode = async (payload: string): Promise<string> => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  // Handle QR Code generation and modal display
  const handleShowQR = async (warga: Warga) => {
    setIsGeneratingQR(true);
    
    try {
      const transactionId = generateTransactionId();
      const payload = makeDemoPayload(warga, transactionId);
      const qrCodeDataUrl = await generateQRCode(payload);
      
      setSelectedWarga({
        warga,
        transactionId,
        payload,
        qrCodeDataUrl
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Gagal membuat QR Code. Silakan coba lagi.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download QR Code as PNG
  const downloadQR = () => {
    if (!selectedWarga) return;
    
    const link = document.createElement('a');
    link.download = `QR_Payment_${selectedWarga.warga.nama.replace(/\s+/g, '_')}_${selectedWarga.transactionId}.png`;
    link.href = selectedWarga.qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy payload to clipboard
  const copyPayload = async () => {
    if (!selectedWarga) return;
    
    try {
      await navigator.clipboard.writeText(selectedWarga.payload);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Gagal menyalin payload. Silakan coba lagi.');
    }
  };

  // Close modal
  const closeModal = () => {
    setSelectedWarga(null);
    setCopySuccess(false);
  };

  // Filter data based on search term
  const filteredData = dataWarga.filter(warga =>
    warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Daftar Tagihan Warga</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Daftar tagihan iuran bulanan warga dengan sistem pembayaran QRIS.
          Klik alamat atau tombol QR untuk menampilkan kode pembayaran.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama atau alamat warga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl text-white p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold">{filteredData.length}</h3>
            <p className="text-emerald-100">Total Warga</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold">Rp {(175000).toLocaleString('id-ID')}</h3>
            <p className="text-emerald-100">Nominal per Warga</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold">Rp {(filteredData.length * 175000).toLocaleString('id-ID')}</h3>
            <p className="text-emerald-100">Total Tagihan</p>
          </div>
        </div>
      </div>

      {/* Warga Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Warga</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Alamat</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Nominal Tagihan</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((warga, index) => (
                <tr key={warga.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {warga.nama.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{warga.nama}</div>
                        <div className="text-sm text-gray-500">ID: {String(warga.id).padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleShowQR(warga)}
                      className="text-sm text-gray-900 hover:text-emerald-600 hover:underline transition-colors text-left"
                      disabled={isGeneratingQR}
                    >
                      {warga.alamat}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      Rp {warga.nominalTagihan.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleShowQR(warga)}
                      disabled={isGeneratingQR}
                      className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isGeneratingQR ? 'Generating...' : 'Tampilkan QR'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada data warga yang ditemukan</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedWarga && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">QR Code Pembayaran</h3>
                <p className="text-sm text-gray-600">Scan untuk melakukan pembayaran</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Warga Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">
                      {selectedWarga.warga.nama.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedWarga.warga.nama}</h4>
                    <p className="text-sm text-gray-600">{selectedWarga.warga.alamat}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nominal:</span>
                    <p className="font-bold text-emerald-600">
                      Rp {selectedWarga.warga.nominalTagihan.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">ID Transaksi:</span>
                    <p className="font-mono text-xs text-gray-900 break-all">
                      {selectedWarga.transactionId}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                  <img
                    src={selectedWarga.qrCodeDataUrl}
                    alt="QR Code Pembayaran"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Scan QR Code dengan aplikasi pembayaran digital Anda
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR Code (PNG)</span>
                </button>

                <button
                  onClick={copyPayload}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    copySuccess
                      ? 'bg-green-600 text-white'
                      : 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Payload Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Salin Payload</span>
                    </>
                  )}
                </button>
              </div>

              {/* Payload Preview */}
              <div className="mt-6">
                <h5 className="font-semibold text-gray-900 mb-2">Preview Payload:</h5>
                <div className="bg-gray-100 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {selectedWarga.payload}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarTagihan;