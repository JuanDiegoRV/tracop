import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { SiembraScreen } from './components/SiembraScreen';
import { CosechaScreen } from './components/CosechaScreen';
import { TransporteScreen } from './components/TransporteScreen';
import { AcopioScreen } from './components/AcopioScreen';
import { TrazabilidadScreen } from './components/TrazabilidadScreen';
import { Sprout, Package, Truck, Warehouse, LayoutDashboard, GitBranch, Award, QrCode } from 'lucide-react';
import { CertificadosScreen } from './components/CertificadosScreen';
import { AccesosQRScreen } from './components/AccesosQRScreen';
import { PortalQRScreen } from './components/PortalQRScreen';
import { createAutoId, createAutoLoteCode, parsePortalFromLocation } from './utils/portal';

export interface SiembraData {
  id: string;
  codigoLote: string;
  fechaSiembra: string;
  estado: 'En curso' | 'Completada' | 'Cancelada';
  tipoCultivo: string;
  fertilizantesAplicados: string;
  metodoSiembra: 'Manual' | 'Mecanizada' | 'Directa' | 'Transplante';
  fechaEstimadaCosecha: string;
  comentariosAdicionales?: string;
  siembraBloqueada?: boolean;
}

export interface CosechaData {
  id: string;
  codigoLoteCosecha: string;
  idSiembra: string;
  fechaCosecha: string;
  estado: 'Planificada' | 'En proceso' | 'Completada' | 'En almacÃ©n';
  cantidadCosechada: number;
  metodoCosecha: 'Manual' | 'Mecanizada' | 'Mixta';
  condicionesClimaticas: 'Soleado' | 'Nublado' | 'Lluvia';
  herramientasEquipo: string;
  tipoAlmacenamiento: 'Ambiente' | 'Refrigerado' | 'Controlado';
  tratamientoPostCosecha: 'Lavado' | 'ClasificaciÃ³n' | 'Encerado' | 'Ninguno';
  fotosProducto?: string;
  observaciones: string;
}

export interface TransporteData {
  id: string;
  idCosecha: string;
  estado: 'Programado' | 'En trÃ¡nsito' | 'Cancelado' | 'Incidente';
  tipoTransporte: 'Terrestre refrigerado' | 'Mixto';
  empresaTransportista: string;
  telefonoContacto: string;
  placaVehiculo: string;
  tipoVehiculo: 'CamiÃ³n' | 'Camioneta' | 'FurgÃ³n' | 'Contenedor';
  sistemaRefrigeracion: boolean;
  direccionOrigen: string;
  direccionDestino: string;
  descripcion: string;
  numeroContenedores: number;
  fechaHoraCarga: string;
  fechaHoraLlegada: string;
  condicionProductoCarga: 'Excelente' | 'Buena' | 'Aceptable' | 'Mala';
}

export interface AcopioData {
  id: string;
  idTransporte: string;
  idCosecha: string;
  fechaHoraRecepcion: string;
  estado: 'Recibido' | 'En inspecciÃ³n' | 'Almacenado' | 'Clasificado' | 'Despachado' | 'Rechazado';
  productoRecibido: string;
  cantidadRealRecibida: number;
  nivelCalidad: 'Excelente' | 'Buena' | 'Regular' | 'Mala' | 'Rechazada';
  categoriaAsignada: 'Extra' | 'Primera' | 'Segunda' | 'Tercera' | 'Descarte';
  tratamientosAplicados: string[];
  productosAplicados: string;
}

const initialSiembras: SiembraData[] = [
  {
    id: 'S001',
    codigoLote: 'LOT-2024-001',
    fechaSiembra: '2024-09-15',
    estado: 'Completada',
    tipoCultivo: 'Tomate Cherry',
    fertilizantesAplicados: 'NPK 15-15-15, Compost orgÃ¡nico',
    metodoSiembra: 'Transplante',
    fechaEstimadaCosecha: '2024-11-20',
    comentariosAdicionales: 'Lote de ejemplo',
    siembraBloqueada: true
  },
  {
    id: 'S002',
    codigoLote: 'LOT-2024-002',
    fechaSiembra: '2024-10-01',
    estado: 'En curso',
    tipoCultivo: 'Lechuga Romana',
    fertilizantesAplicados: 'Fertilizante orgÃ¡nico',
    metodoSiembra: 'Directa',
    fechaEstimadaCosecha: '2024-12-01',
    siembraBloqueada: false
  }
];

const initialCosechas: CosechaData[] = [
  {
    id: 'C001',
    codigoLoteCosecha: 'COS-2024-001',
    idSiembra: 'S001',
    fechaCosecha: '2024-11-20',
    estado: 'Completada',
    cantidadCosechada: 3500,
    metodoCosecha: 'Manual',
    condicionesClimaticas: 'Soleado',
    herramientasEquipo: 'Tijeras de podar, canastas de recolecciÃ³n',
    tipoAlmacenamiento: 'Refrigerado',
    tratamientoPostCosecha: 'Lavado',
    observaciones: 'Cosecha de excelente calidad'
  }
];

const initialTransportes: TransporteData[] = [
  {
    id: 'T001',
    idCosecha: 'C001',
    estado: 'En trÃ¡nsito',
    tipoTransporte: 'Terrestre refrigerado',
    empresaTransportista: 'TransAgro S.A.',
    telefonoContacto: '+57 300 123 4567',
    placaVehiculo: 'ABC-123',
    tipoVehiculo: 'CamiÃ³n',
    sistemaRefrigeracion: true,
    direccionOrigen: 'Campo Norte - Parcela 12',
    direccionDestino: 'Centro de Acopio Principal, Calle 45 #23-10',
    descripcion: 'Transporte de tomate cherry',
    numeroContenedores: 2,
    fechaHoraCarga: '2024-11-21T08:00',
    fechaHoraLlegada: '2024-11-21T14:00',
    condicionProductoCarga: 'Excelente'
  }
];

const initialAcopios: AcopioData[] = [];

const STORAGE_KEYS = {
  siembras: 'tracop_siembras',
  cosechas: 'tracop_cosechas',
  transportes: 'tracop_transportes',
  acopios: 'tracop_acopios'
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'siembra' | 'cosecha' | 'transporte' | 'acopio' | 'certificados' | 'trazabilidad' | 'accesos-qr'>('dashboard');
  const [siembras, setSiembras] = useState<SiembraData[]>(() => readStored(STORAGE_KEYS.siembras, initialSiembras));
  const [cosechas, setCosechas] = useState<CosechaData[]>(() => readStored(STORAGE_KEYS.cosechas, initialCosechas));
  const [transportes, setTransportes] = useState<TransporteData[]>(() => readStored(STORAGE_KEYS.transportes, initialTransportes));
  const [acopios, setAcopios] = useState<AcopioData[]>(() => readStored(STORAGE_KEYS.acopios, initialAcopios));
  const portalContext = useMemo(() => parsePortalFromLocation(), []);

  useEffect(() => localStorage.setItem(STORAGE_KEYS.siembras, JSON.stringify(siembras)), [siembras]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.cosechas, JSON.stringify(cosechas)), [cosechas]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.transportes, JSON.stringify(transportes)), [transportes]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.acopios, JSON.stringify(acopios)), [acopios]);

  const onAddSiembra = (siembra: SiembraData) => setSiembras((prev) => [...prev, siembra]);
  const onUpdateSiembra = (updated: SiembraData) => setSiembras((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  const onAddCosecha = (cosecha: CosechaData) => setCosechas((prev) => [...prev, cosecha]);
  const onUpdateCosecha = (updated: CosechaData) => setCosechas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  const onAddTransporte = (transporte: TransporteData) => setTransportes((prev) => [...prev, transporte]);
  const onUpdateTransporte = (updated: TransporteData) => setTransportes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const onAddAcopio = (acopio: AcopioData) => setAcopios((prev) => [...prev, acopio]);
  const onUpdateAcopio = (updated: AcopioData) => setAcopios((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const onCreateDemoLote = () => {
    onAddSiembra({
      id: createAutoId('S'),
      codigoLote: createAutoLoteCode(),
      fechaSiembra: today(),
      estado: 'En curso',
      tipoCultivo: '',
      fertilizantesAplicados: '',
      metodoSiembra: 'Manual',
      fechaEstimadaCosecha: today(),
      comentariosAdicionales: '',
      siembraBloqueada: false
    });
    setActiveScreen('accesos-qr');
  };

  if (portalContext) {
    return (
      <PortalQRScreen
        role={portalContext.role}
        siembraId={portalContext.siembraId}
        siembras={siembras}
        cosechas={cosechas}
        transportes={transportes}
        acopios={acopios}
        onUpdateSiembra={onUpdateSiembra}
        onAddCosecha={onAddCosecha}
        onUpdateCosecha={onUpdateCosecha}
        onAddTransporte={onAddTransporte}
        onUpdateTransporte={onUpdateTransporte}
        onAddAcopio={onAddAcopio}
        onUpdateAcopio={onUpdateAcopio}
        onExit={() => {
          window.location.href = `${window.location.origin}${window.location.pathname}`;
        }}
      />
    );
  }

  const screens = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trazabilidad', label: 'Trazabilidad', icon: GitBranch },
    { id: 'accesos-qr', label: 'Accesos QR', icon: QrCode },
    { id: 'siembra', label: 'Siembra', icon: Sprout },
    { id: 'cosecha', label: 'Cosecha', icon: Package },
    { id: 'transporte', label: 'Transporte', icon: Truck },
    { id: 'acopio', label: 'Acopio', icon: Warehouse },
    { id: 'certificados', label: 'Certificados', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Sprout className="w-8 h-8" />
            <div>
              <h1 className="text-2xl">TRACOP</h1>
              <p className="text-green-100 text-sm">Trazabilidad de la Cadena de Origen Productivo</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {screens.map((screen) => {
              const Icon = screen.icon;
              return (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id as typeof activeScreen)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${activeScreen === screen.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{screen.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeScreen === 'dashboard' && <Dashboard siembras={siembras} cosechas={cosechas} transportes={transportes} acopios={acopios} />}
        {activeScreen === 'trazabilidad' && <TrazabilidadScreen siembras={siembras} cosechas={cosechas} transportes={transportes} acopios={acopios} />}
        {activeScreen === 'accesos-qr' && <AccesosQRScreen siembras={siembras} onCreateDemoLote={onCreateDemoLote} />}
        {activeScreen === 'siembra' && <SiembraScreen siembras={siembras} onAddSiembra={onAddSiembra} onUpdateSiembra={onUpdateSiembra} />}
        {activeScreen === 'cosecha' && <CosechaScreen cosechas={cosechas} siembras={siembras} onAddCosecha={onAddCosecha} onUpdateCosecha={onUpdateCosecha} />}
        {activeScreen === 'transporte' && <TransporteScreen transportes={transportes} cosechas={cosechas} onAddTransporte={onAddTransporte} onUpdateTransporte={onUpdateTransporte} />}
        {activeScreen === 'acopio' && <AcopioScreen acopios={acopios} transportes={transportes} cosechas={cosechas} onAddAcopio={onAddAcopio} onUpdateAcopio={onUpdateAcopio} />}
        {activeScreen === 'certificados' && <CertificadosScreen siembras={siembras} cosechas={cosechas} transportes={transportes} acopios={acopios} />}
      </main>
    </div>
  );
}
