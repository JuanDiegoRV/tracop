import type { SiembraData } from '../App';
import { QrCode, Link as LinkIcon, Plus, ExternalLink } from 'lucide-react';
import QRCode from 'react-qr-code';
import { buildPortalUrl, PORTAL_ROLES, PORTAL_ROLE_LABELS } from '../utils/portal';

interface AccesosQRScreenProps {
  siembras: SiembraData[];
  onCreateDemoLote: () => void;
}

export function AccesosQRScreen({ siembras, onCreateDemoLote }: AccesosQRScreenProps) {
  const stageBadge = (siembra: SiembraData) => {
    if (siembra.estado === 'Completada') return 'bg-green-100 text-green-700';
    if (siembra.estado === 'Cancelada') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <QrCode className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Accesos por QR</h2>
              <p className="text-sm text-gray-600">
                Un QR por rol y por lote para demostrar acceso con privilegios m&iacute;nimos.
              </p>
            </div>
          </div>
          <button
            onClick={onCreateDemoLote}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Lote Demo
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {siembras.map((siembra) => (
          <div key={siembra.id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-gray-900">{siembra.codigoLote}</h3>
                <p className="text-sm text-gray-600">
                  {siembra.tipoCultivo || 'Cultivo pendiente'} | ID: {siembra.id}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${stageBadge(siembra)}`}>
                Siembra: {siembra.estado}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PORTAL_ROLES.map((role) => {
                const link = buildPortalUrl(role, siembra.id);
                return (
                  <div key={role} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">{PORTAL_ROLE_LABELS[role]}</p>
                    <div className="bg-white inline-block p-2 rounded-md border border-gray-100">
                      <QRCode value={link} size={110} />
                    </div>
                    <div className="mt-3 space-y-2">
                      <a
                        href={link}
                        className="flex items-center justify-center gap-2 text-sm w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir
                      </a>
                      <button
                        onClick={() => navigator.clipboard?.writeText(link)}
                        className="flex items-center justify-center gap-2 text-sm w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Copiar enlace
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {siembras.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-500">
          No hay lotes registrados. Crea un lote demo para generar QRs.
        </div>
      )}
    </div>
  );
}
