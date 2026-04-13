import { useEffect, useMemo, useState } from 'react';
import type { AcopioData, CosechaData, SiembraData, TransporteData } from '../App';
import { CheckCircle2, Lock, ShieldCheck, Sprout, Truck, Warehouse, Wheat } from 'lucide-react';
import { PortalRole, PORTAL_ROLE_LABELS, createAutoId } from '../utils/portal';

interface PortalQRScreenProps {
  role: PortalRole;
  siembraId: string;
  siembras: SiembraData[];
  cosechas: CosechaData[];
  transportes: TransporteData[];
  acopios: AcopioData[];
  onUpdateSiembra: (siembra: SiembraData) => void;
  onAddCosecha: (cosecha: CosechaData) => void;
  onUpdateCosecha: (cosecha: CosechaData) => void;
  onAddTransporte: (transporte: TransporteData) => void;
  onUpdateTransporte: (transporte: TransporteData) => void;
  onAddAcopio: (acopio: AcopioData) => void;
  onUpdateAcopio: (acopio: AcopioData) => void;
  onExit: () => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function PortalQRScreen(props: PortalQRScreenProps) {
  const {
    role, siembraId, siembras, cosechas, transportes, acopios,
    onUpdateSiembra, onAddCosecha, onUpdateCosecha, onAddTransporte, onUpdateTransporte, onAddAcopio, onUpdateAcopio, onExit
  } = props;

  const siembra = siembras.find((x) => x.id === siembraId);
  const cosecha = cosechas.find((x) => x.idSiembra === siembraId);
  const transporte = cosecha ? transportes.find((x) => x.idCosecha === cosecha.id) : undefined;
  const acopio = transporte ? acopios.find((x) => x.idTransporte === transporte.id) : undefined;

  const [msg, setMsg] = useState('');
  const [siembraForm, setSiembraForm] = useState<Partial<SiembraData>>({});
  const [cosechaForm, setCosechaForm] = useState<Partial<CosechaData>>({});
  const [transporteForm, setTransporteForm] = useState<Partial<TransporteData>>({});
  const [acopioForm, setAcopioForm] = useState<Partial<AcopioData>>({});
  const [tratamientos, setTratamientos] = useState('');

  useEffect(() => {
    if (!siembra) return;
    setSiembraForm({ ...siembra });
    setCosechaForm({
      id: cosecha?.id ?? createAutoId('C'),
      codigoLoteCosecha: cosecha?.codigoLoteCosecha ?? `COS-${siembra.codigoLote}`,
      idSiembra: siembra.id,
      fechaCosecha: cosecha?.fechaCosecha ?? today(),
      estado: cosecha?.estado ?? 'En proceso',
      metodoCosecha: cosecha?.metodoCosecha ?? 'Manual',
      cantidadCosechada: cosecha?.cantidadCosechada ?? 0,
      condicionesClimaticas: cosecha?.condicionesClimaticas ?? 'Soleado',
      herramientasEquipo: cosecha?.herramientasEquipo ?? '',
      tipoAlmacenamiento: cosecha?.tipoAlmacenamiento ?? 'Ambiente',
      tratamientoPostCosecha: cosecha?.tratamientoPostCosecha ?? 'Ninguno',
      observaciones: cosecha?.observaciones ?? ''
    });
    setTransporteForm({
      id: transporte?.id ?? createAutoId('T'),
      idCosecha: cosecha?.id ?? '',
      estado: transporte?.estado ?? 'Programado',
      tipoTransporte: transporte?.tipoTransporte ?? 'Terrestre refrigerado',
      empresaTransportista: transporte?.empresaTransportista ?? '',
      telefonoContacto: transporte?.telefonoContacto ?? '',
      placaVehiculo: transporte?.placaVehiculo ?? '',
      tipoVehiculo: transporte?.tipoVehiculo ?? 'Camión',
      sistemaRefrigeracion: transporte?.sistemaRefrigeracion ?? false,
      direccionOrigen: transporte?.direccionOrigen ?? '',
      direccionDestino: transporte?.direccionDestino ?? '',
      descripcion: transporte?.descripcion ?? '',
      numeroContenedores: transporte?.numeroContenedores ?? 1,
      fechaHoraCarga: transporte?.fechaHoraCarga ?? nowLocal(),
      fechaHoraLlegada: transporte?.fechaHoraLlegada ?? nowLocal(),
      condicionProductoCarga: transporte?.condicionProductoCarga ?? 'Buena'
    });
    setAcopioForm({
      id: acopio?.id ?? createAutoId('A'),
      idTransporte: transporte?.id ?? '',
      idCosecha: cosecha?.id ?? '',
      fechaHoraRecepcion: acopio?.fechaHoraRecepcion ?? nowLocal(),
      estado: acopio?.estado ?? 'Recibido',
      productoRecibido: acopio?.productoRecibido ?? siembra.tipoCultivo,
      cantidadRealRecibida: acopio?.cantidadRealRecibida ?? (cosecha?.cantidadCosechada || 0),
      nivelCalidad: acopio?.nivelCalidad ?? 'Buena',
      categoriaAsignada: acopio?.categoriaAsignada ?? 'Primera',
      tratamientosAplicados: acopio?.tratamientosAplicados ?? [],
      productosAplicados: acopio?.productosAplicados ?? ''
    });
    setTratamientos((acopio?.tratamientosAplicados || []).join(', '));
    setMsg('');
  }, [siembraId, siembra, cosecha, transporte, acopio]);

  const etapas = useMemo(() => ({
    siembra: siembra?.estado || 'Pendiente',
    cosecha: cosecha?.estado || 'Pendiente',
    transporte: transporte?.estado || 'Pendiente',
    acopio: acopio?.estado || 'Pendiente'
  }), [siembra, cosecha, transporte, acopio]);

  if (!siembra) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-xl w-full text-center">
          <h1 className="text-xl text-gray-900 mb-3">Lote no encontrado</h1>
          <p className="text-gray-600 mb-6">Este QR no corresponde a un lote de la demo.</p>
          <button onClick={onExit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Volver</button>
        </div>
      </div>
    );
  }

  const saveSiembra = (completed: boolean) => {
    const payload: SiembraData = {
      ...siembra,
      ...siembraForm,
      id: siembra.id,
      codigoLote: siembra.codigoLote,
      estado: completed ? 'Completada' : (siembraForm.estado || 'En curso'),
      siembraBloqueada: true
    } as SiembraData;
    onUpdateSiembra(payload);
    setMsg(completed ? 'Siembra completada. Este mismo QR te redirige a cosecha.' : 'Siembra guardada.');
  };

  const saveCosecha = (completed: boolean) => {
    const payload: CosechaData = {
      id: String(cosechaForm.id || createAutoId('C')),
      codigoLoteCosecha: String(cosechaForm.codigoLoteCosecha || `COS-${siembra.codigoLote}`),
      idSiembra: siembra.id,
      fechaCosecha: String(cosechaForm.fechaCosecha || today()),
      estado: completed ? 'Completada' : ((cosechaForm.estado as CosechaData['estado']) || 'En proceso'),
      cantidadCosechada: Number(cosechaForm.cantidadCosechada || 0),
      metodoCosecha: (cosechaForm.metodoCosecha as CosechaData['metodoCosecha']) || 'Manual',
      condicionesClimaticas: (cosechaForm.condicionesClimaticas as CosechaData['condicionesClimaticas']) || 'Soleado',
      herramientasEquipo: String(cosechaForm.herramientasEquipo || ''),
      tipoAlmacenamiento: (cosechaForm.tipoAlmacenamiento as CosechaData['tipoAlmacenamiento']) || 'Ambiente',
      tratamientoPostCosecha: (cosechaForm.tratamientoPostCosecha as CosechaData['tratamientoPostCosecha']) || 'Ninguno',
      observaciones: String(cosechaForm.observaciones || '')
    };
    if (cosecha) onUpdateCosecha(payload); else onAddCosecha(payload);
    setMsg(completed ? 'Cosecha completada. El rol agricultor termina aquí.' : 'Cosecha guardada.');
  };

  const saveTransporte = () => {
    if (!cosecha) return;
    const payload: TransporteData = {
      id: String(transporteForm.id || createAutoId('T')),
      idCosecha: cosecha.id,
      estado: (transporteForm.estado as TransporteData['estado']) || 'Programado',
      tipoTransporte: (transporteForm.tipoTransporte as TransporteData['tipoTransporte']) || 'Terrestre refrigerado',
      empresaTransportista: String(transporteForm.empresaTransportista || ''),
      telefonoContacto: String(transporteForm.telefonoContacto || ''),
      placaVehiculo: String(transporteForm.placaVehiculo || ''),
      tipoVehiculo: (transporteForm.tipoVehiculo as TransporteData['tipoVehiculo']) || 'Camión',
      sistemaRefrigeracion: !!transporteForm.sistemaRefrigeracion,
      direccionOrigen: String(transporteForm.direccionOrigen || ''),
      direccionDestino: String(transporteForm.direccionDestino || ''),
      descripcion: String(transporteForm.descripcion || ''),
      numeroContenedores: Number(transporteForm.numeroContenedores || 1),
      fechaHoraCarga: String(transporteForm.fechaHoraCarga || nowLocal()),
      fechaHoraLlegada: String(transporteForm.fechaHoraLlegada || nowLocal()),
      condicionProductoCarga: (transporteForm.condicionProductoCarga as TransporteData['condicionProductoCarga']) || 'Buena'
    };
    if (transporte) onUpdateTransporte(payload); else onAddTransporte(payload);
    setMsg('Transporte guardado.');
  };

  const saveAcopio = () => {
    if (!cosecha || !transporte) return;
    const payload: AcopioData = {
      id: String(acopioForm.id || createAutoId('A')),
      idTransporte: transporte.id,
      idCosecha: cosecha.id,
      fechaHoraRecepcion: String(acopioForm.fechaHoraRecepcion || nowLocal()),
      estado: (acopioForm.estado as AcopioData['estado']) || 'Recibido',
      productoRecibido: String(acopioForm.productoRecibido || siembra.tipoCultivo),
      cantidadRealRecibida: Number(acopioForm.cantidadRealRecibida || 0),
      nivelCalidad: (acopioForm.nivelCalidad as AcopioData['nivelCalidad']) || 'Buena',
      categoriaAsignada: (acopioForm.categoriaAsignada as AcopioData['categoriaAsignada']) || 'Primera',
      tratamientosAplicados: tratamientos.split(',').map((x) => x.trim()).filter(Boolean),
      productosAplicados: String(acopioForm.productosAplicados || '')
    };
    if (acopio) onUpdateAcopio(payload); else onAddAcopio(payload);
    setMsg('Acopio guardado.');
  };

  const coreLocked = !!siembra.siembraBloqueada;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Acceso QR</p>
              <h1 className="text-2xl text-gray-900">{PORTAL_ROLE_LABELS[role]}</h1>
              <p className="text-gray-600 text-sm mt-1">Lote: <strong>{siembra.codigoLote}</strong> | Cultivo: <strong>{siembra.tipoCultivo || 'Pendiente'}</strong></p>
            </div>
            <button onClick={onExit} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Volver</button>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-green-50 text-green-700 rounded-md px-3 py-2">Siembra: {etapas.siembra}</div>
            <div className="bg-yellow-50 text-yellow-700 rounded-md px-3 py-2">Cosecha: {etapas.cosecha}</div>
            <div className="bg-orange-50 text-orange-700 rounded-md px-3 py-2">Transporte: {etapas.transporte}</div>
            <div className="bg-purple-50 text-purple-700 rounded-md px-3 py-2">Acopio: {etapas.acopio}</div>
          </div>
        </div>

        {role === 'agricultor' && siembra.estado !== 'Completada' && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-700"><Sprout className="w-5 h-5" /><h2 className="text-lg">Siembra</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input disabled value={siembra.id} className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200" />
              <input disabled value={siembra.codigoLote} className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200" />
              <input type="date" value={siembraForm.fechaSiembra || ''} disabled={coreLocked} onChange={(e) => setSiembraForm({ ...siembraForm, fechaSiembra: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100" />
              <input type="text" placeholder="Tipo cultivo" value={siembraForm.tipoCultivo || ''} disabled={coreLocked} onChange={(e) => setSiembraForm({ ...siembraForm, tipoCultivo: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100" />
              <select value={siembraForm.metodoSiembra || 'Manual'} disabled={coreLocked} onChange={(e) => setSiembraForm({ ...siembraForm, metodoSiembra: e.target.value as SiembraData['metodoSiembra'] })} className="px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100">
                <option value="Manual">Manual</option><option value="Mecanizada">Mecanizada</option><option value="Directa">Directa</option><option value="Transplante">Transplante</option>
              </select>
              <input type="date" value={siembraForm.fechaEstimadaCosecha || ''} onChange={(e) => setSiembraForm({ ...siembraForm, fechaEstimadaCosecha: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
            </div>
            <textarea rows={2} placeholder="Fertilizantes" value={siembraForm.fertilizantesAplicados || ''} onChange={(e) => setSiembraForm({ ...siembraForm, fertilizantesAplicados: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" />
            <textarea rows={2} placeholder="Comentarios adicionales" value={siembraForm.comentariosAdicionales || ''} onChange={(e) => setSiembraForm({ ...siembraForm, comentariosAdicionales: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" />
            {coreLocked && <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-md"><Lock className="w-4 h-4" />Campos fijos bloqueados para mantener trazabilidad.</div>}
            <div className="flex gap-3">
              <button onClick={() => saveSiembra(false)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Guardar</button>
              <button onClick={() => saveSiembra(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Completar Siembra</button>
            </div>
          </div>
        )}

        {role === 'agricultor' && siembra.estado === 'Completada' && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-yellow-700"><Wheat className="w-5 h-5" /><h2 className="text-lg">Cosecha</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input disabled value={cosechaForm.id || ''} className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200" />
              <input disabled value={cosechaForm.codigoLoteCosecha || ''} className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200" />
              <input type="date" value={cosechaForm.fechaCosecha || ''} onChange={(e) => setCosechaForm({ ...cosechaForm, fechaCosecha: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
              <select value={cosechaForm.metodoCosecha || 'Manual'} onChange={(e) => setCosechaForm({ ...cosechaForm, metodoCosecha: e.target.value as CosechaData['metodoCosecha'] })} className="px-3 py-2 rounded-md border border-gray-300">
                <option value="Manual">Manual</option><option value="Mecanizada">Mecanizada</option><option value="Mixta">Mixta</option>
              </select>
              <input type="number" value={cosechaForm.cantidadCosechada || 0} onChange={(e) => setCosechaForm({ ...cosechaForm, cantidadCosechada: Number(e.target.value) })} className="px-3 py-2 rounded-md border border-gray-300" />
            </div>
            <textarea rows={2} placeholder="Observaciones" value={cosechaForm.observaciones || ''} onChange={(e) => setCosechaForm({ ...cosechaForm, observaciones: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" />
            <div className="flex gap-3">
              <button onClick={() => saveCosecha(false)} className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Guardar</button>
              <button onClick={() => saveCosecha(true)} className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800">Completar Cosecha</button>
            </div>
            {cosecha?.estado === 'Completada' && <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md"><CheckCircle2 className="w-4 h-4" />Rol agricultor finalizado.</div>}
          </div>
        )}

        {role === 'transportista' && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-orange-700"><Truck className="w-5 h-5" /><h2 className="text-lg">Transporte</h2></div>
            {!cosecha || cosecha.estado !== 'Completada' ? <p className="text-sm text-gray-600">Pendiente: la cosecha debe estar completada.</p> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input disabled value={transporteForm.id || ''} className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200" />
                  <input type="text" placeholder="Empresa" value={transporteForm.empresaTransportista || ''} onChange={(e) => setTransporteForm({ ...transporteForm, empresaTransportista: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <input type="text" placeholder="Teléfono" value={transporteForm.telefonoContacto || ''} onChange={(e) => setTransporteForm({ ...transporteForm, telefonoContacto: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <input type="text" placeholder="Placa" value={transporteForm.placaVehiculo || ''} onChange={(e) => setTransporteForm({ ...transporteForm, placaVehiculo: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <input type="datetime-local" value={transporteForm.fechaHoraCarga || ''} onChange={(e) => setTransporteForm({ ...transporteForm, fechaHoraCarga: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <input type="datetime-local" value={transporteForm.fechaHoraLlegada || ''} onChange={(e) => setTransporteForm({ ...transporteForm, fechaHoraLlegada: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                </div>
                <textarea rows={2} placeholder="Descripción" value={transporteForm.descripcion || ''} onChange={(e) => setTransporteForm({ ...transporteForm, descripcion: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" />
                <button onClick={saveTransporte} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">Guardar Transporte</button>
              </>
            )}
          </div>
        )}

        {role === 'acopio' && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-700"><Warehouse className="w-5 h-5" /><h2 className="text-lg">Acopio</h2></div>
            {!transporte ? <p className="text-sm text-gray-600">Pendiente: no existe transporte registrado.</p> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input disabled value={acopioForm.id || ''} className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200" />
                  <input type="datetime-local" value={acopioForm.fechaHoraRecepcion || ''} onChange={(e) => setAcopioForm({ ...acopioForm, fechaHoraRecepcion: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <input type="text" placeholder="Producto" value={acopioForm.productoRecibido || ''} onChange={(e) => setAcopioForm({ ...acopioForm, productoRecibido: e.target.value })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <input type="number" placeholder="Cantidad kg" value={acopioForm.cantidadRealRecibida || 0} onChange={(e) => setAcopioForm({ ...acopioForm, cantidadRealRecibida: Number(e.target.value) })} className="px-3 py-2 rounded-md border border-gray-300" />
                  <select value={acopioForm.nivelCalidad || 'Buena'} onChange={(e) => setAcopioForm({ ...acopioForm, nivelCalidad: e.target.value as AcopioData['nivelCalidad'] })} className="px-3 py-2 rounded-md border border-gray-300">
                    <option value="Excelente">Excelente</option><option value="Buena">Buena</option><option value="Regular">Regular</option><option value="Mala">Mala</option><option value="Rechazada">Rechazada</option>
                  </select>
                  <select value={acopioForm.categoriaAsignada || 'Primera'} onChange={(e) => setAcopioForm({ ...acopioForm, categoriaAsignada: e.target.value as AcopioData['categoriaAsignada'] })} className="px-3 py-2 rounded-md border border-gray-300">
                    <option value="Extra">Extra</option><option value="Primera">Primera</option><option value="Segunda">Segunda</option><option value="Tercera">Tercera</option><option value="Descarte">Descarte</option>
                  </select>
                </div>
                <input type="text" placeholder="Tratamientos (coma separada)" value={tratamientos} onChange={(e) => setTratamientos(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300" />
                <textarea rows={2} placeholder="Productos aplicados" value={acopioForm.productosAplicados || ''} onChange={(e) => setAcopioForm({ ...acopioForm, productosAplicados: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" />
                <button onClick={saveAcopio} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Guardar Acopio</button>
              </>
            )}
          </div>
        )}

        {role === 'consumidor' && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700"><ShieldCheck className="w-5 h-5" /><h2 className="text-lg">Información para consumidor</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-3"><p className="text-xs text-gray-500">Lote</p><p>{siembra.codigoLote}</p></div>
              <div className="bg-gray-50 rounded-md p-3"><p className="text-xs text-gray-500">Cultivo</p><p>{siembra.tipoCultivo || 'Pendiente'}</p></div>
              <div className="bg-gray-50 rounded-md p-3"><p className="text-xs text-gray-500">Siembra</p><p>{siembra.fechaSiembra || 'Pendiente'}</p></div>
              <div className="bg-gray-50 rounded-md p-3"><p className="text-xs text-gray-500">Estado</p><p>{acopio?.estado || transporte?.estado || cosecha?.estado || siembra.estado}</p></div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span>Origen identificado del lote.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span>Trazabilidad por etapas disponible.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /><span>Calidad reportada: {acopio?.nivelCalidad || 'Pendiente'}.</span></li>
            </ul>
          </div>
        )}

        {msg && <div className="bg-blue-50 text-blue-700 rounded-lg p-3 text-sm">{msg}</div>}
      </div>
    </div>
  );
}
