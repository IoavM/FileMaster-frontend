import React, { useState, useRef } from 'react';
import { Scissors, Mic, RefreshCw, QrCode, FileText, Music, Table, Download, Upload, Play, Pause, Moon, Sun, Image } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const App = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [darkMode, setDarkMode] = useState(true);

  const tabs = [
    { id: 'qr', name: 'Código QR', icon: QrCode },
    { id: 'pdf', name: 'Recortar PDF', icon: Scissors },
    { id: 'tts', name: 'Texto a Voz', icon: Mic },
    { id: 'converter', name: 'Convertidor', icon: RefreshCw },
    { id: 'video', name: 'Descargar Video', icon: Download },
    { id: 'compress', name: 'Comprimir Imagen', icon: Image }
  ];

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="header">
        <div className="header-contenido">
          <div className="header-marca">
            <div className="icono-marca">
              <RefreshCw size={24} />
            </div>
            <h1 className="titulo-marca">FileMaster</h1>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="boton-tema">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="contenedor-principal">
        <div className="layout-grid">
          <aside className="sidebar">
            <h2 className="sidebar-titulo">Herramientas</h2>
            <nav className="nav-menu">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-item ${activeTab === tab.id ? 'activo' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="area-contenido">
            <div className="tarjeta-contenido">
              {activeTab === 'qr' && <GeneradorQR />}
              {activeTab === 'pdf' && <RecortadorPDF />}
              {activeTab === 'tts' && <TextoAVoz />}
              {activeTab === 'converter' && <ConvertidorArchivos />}
              {activeTab === 'video' && <DescargadorVideo />}
              {activeTab === 'compress' && <CompresorImagen />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const GeneradorQR = () => {
  const [texto, setTexto] = useState('');
  const [urlQR, setUrlQR] = useState('');

  const generarQR = () => {
    if (texto) {
      setUrlQR(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(texto)}`);
    }
  };

  const descargarQR = async () => {
    try {
      const response = await fetch(urlQR);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'codigo-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el QR:', error);
    }
  };

  return (
    <div className="seccion-herramienta">
      <div className="encabezado-herramienta">
        <QrCode size={32} className="icono-morado" />
        <h2 className="titulo-herramienta">Generador de Código QR</h2>
      </div>

      <div className="formulario">
        <div className="grupo-input">
          <label className="etiqueta">Texto o URL</label>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ingresa el texto o enlace..."
            className="input-texto"
          />
        </div>

        <button onClick={generarQR} className="boton-primario">
          Generar QR
        </button>

        {urlQR && (
          <div className="resultado-animado">
            <div className="qr-contenedor">
              <img src={urlQR} alt="Código QR" className="qr-imagen" />
            </div>
            <button onClick={descargarQR} className="boton-secundario">
              <Download size={20} />
              <span>Descargar QR</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RecortadorPDF = () => {
  const [archivo, setArchivo] = useState(null);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [paginaInicio, setPaginaInicio] = useState(1);
  const [paginaFin, setPaginaFin] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef(null);

  const manejarArchivo = async (e) => {
    const archivoSeleccionado = e.target.files[0];
    if (archivoSeleccionado && archivoSeleccionado.type === 'application/pdf') {
      setArchivo(archivoSeleccionado);
      setMensaje('Obteniendo información del PDF...');

      const formData = new FormData();
      formData.append('file', archivoSeleccionado);

      try {
        const response = await fetch(`${API_URL}/api/pdf/info`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        setTotalPaginas(data.total_pages);
        setPaginaFin(data.total_pages);
        setMensaje('');
      } catch (error) {
        setMensaje('Error al procesar el PDF');
        console.error(error);
      }
    }
  };

  const recortarPDF = async () => {
    if (!archivo) return;

    setProcesando(true);
    setMensaje('Recortando PDF...');

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('start_page', paginaInicio);
    formData.append('end_page', paginaFin);

    try {
      const response = await fetch(`${API_URL}/api/pdf/cut`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recortado_${archivo.name}`;
        link.click();
        window.URL.revokeObjectURL(url);
        setMensaje('¡PDF recortado exitosamente!');
      } else {
        setMensaje('Error al recortar el PDF');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="seccion-herramienta">
      <div className="encabezado-herramienta">
        <Scissors size={32} className="icono-morado" />
        <h2 className="titulo-herramienta">Recortar PDF</h2>
      </div>

      <div className="zona-subida" onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={manejarArchivo}
          className="input-oculto"
        />
        <Upload size={64} className="icono-subida" />
        <p className="texto-subida">
          {archivo ? archivo.name : 'Haz clic para cargar un PDF'}
        </p>
        <p className="texto-hint">o arrastra y suelta aquí</p>
      </div>

      {mensaje && (
        <div className="info-caja">
          <p>{mensaje}</p>
        </div>
      )}

      {archivo && totalPaginas > 0 && (
        <div className="resultado-animado">
          <div className="info-caja">
            <p>Total de páginas: <span className="texto-destacado">{totalPaginas}</span></p>
          </div>

          <div className="grid-dos">
            <div className="grupo-input">
              <label className="etiqueta">Página inicial</label>
              <input
                type="number"
                min="1"
                max={totalPaginas}
                value={paginaInicio}
                onChange={(e) => setPaginaInicio(parseInt(e.target.value))}
                className="input-texto"
              />
            </div>
            <div className="grupo-input">
              <label className="etiqueta">Página final</label>
              <input
                type="number"
                min="1"
                max={totalPaginas}
                value={paginaFin}
                onChange={(e) => setPaginaFin(parseInt(e.target.value))}
                className="input-texto"
              />
            </div>
          </div>

          <button
            onClick={recortarPDF}
            disabled={procesando}
            className="boton-primario"
          >
            <Scissors size={20} />
            <span>{procesando ? 'Procesando...' : 'Recortar PDF'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const TextoAVoz = () => {
  const [texto, setTexto] = useState('');
  const [idioma, setIdioma] = useState('es-ES');
  const [reproduciendo, setReproduciendo] = useState(false);

  const sintetizarVoz = () => {
    if ('speechSynthesis' in window && texto) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = idioma;
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setReproduciendo(true);
      utterance.onend = () => setReproduciendo(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const detenerVoz = () => {
    window.speechSynthesis.cancel();
    setReproduciendo(false);
  };

  return (
    <div className="seccion-herramienta">
      <div className="encabezado-herramienta">
        <Mic size={32} className="icono-morado" />
        <h2 className="titulo-herramienta">Texto a Voz</h2>
      </div>

      <div className="formulario">
        <div className="grupo-input">
          <label className="etiqueta">Texto a convertir</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe el texto que deseas escuchar..."
            className="input-textarea"
            rows="6"
          />
        </div>

        <div className="grupo-input">
          <label className="etiqueta">Idioma</label>
          <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="input-select">
            <option value="es-ES">Español</option>
            <option value="en-US">English</option>
            <option value="fr-FR">Français</option>
            <option value="de-DE">Deutsch</option>
            <option value="it-IT">Italiano</option>
          </select>
        </div>

        <div className="grid-dos">
          <button
            onClick={sintetizarVoz}
            disabled={!texto || reproduciendo}
            className="boton-primario"
          >
            <Play size={20} />
            <span>Reproducir</span>
          </button>
          <button
            onClick={detenerVoz}
            disabled={!reproduciendo}
            className="boton-secundario"
          >
            <Pause size={20} />
            <span>Detener</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ConvertidorArchivos = () => {
  const [categoria, setCategoria] = useState('imagenes');

  const categorias = [
    { id: 'imagenes', nombre: 'Imágenes', icon: Image },
    { id: 'documentos', nombre: 'Documentos', icon: FileText },
    { id: 'hojas', nombre: 'Hojas de Cálculo', icon: Table }
  ];

  return (
    <div className="seccion-herramienta">
      <div className="encabezado-herramienta">
        <RefreshCw size={32} className="icono-morado" />
        <h2 className="titulo-herramienta">Convertidor de Archivos</h2>
      </div>

      <div className="grid-categorias">
        {categorias.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className={`tarjeta-categoria ${categoria === cat.id ? 'activa' : ''}`}
            >
              <Icon size={32} />
              <span>{cat.nombre}</span>
            </button>
          );
        })}
      </div>

      {categoria === 'imagenes' && <ConvertidorImagenes />}
      {categoria === 'documentos' && <ConvertidorDocumentos />}
      {categoria === 'hojas' && <ConvertidorHojas />}
    </div>
  );
};

const ConvertidorImagenes = () => {
  const [archivo, setArchivo] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState('');
  const [formatoDestino, setFormatoDestino] = useState('png');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef(null);

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setArchivo(file);
      const reader = new FileReader();
      reader.onloadend = () => setPrevisualizacion(reader.result);
      reader.readAsDataURL(file);
      setMensaje('');
    }
  };

  const convertirImagen = async () => {
    if (!archivo) return;

    setProcesando(true);
    setMensaje('Convirtiendo imagen...');

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('format', formatoDestino);

    try {
      const response = await fetch(`${API_URL}/api/image/convert`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `convertido.${formatoDestino}`;
        link.click();
        window.URL.revokeObjectURL(url);
        setMensaje('¡Imagen convertida exitosamente!');
      } else {
        setMensaje('Error al convertir la imagen');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="convertidor-seccion">
      <div className="zona-subida-pequena" onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={manejarArchivo}
          className="input-oculto"
        />
        <Image size={48} className="icono-subida" />
        <p className="texto-subida-pequeno">
          {archivo ? archivo.name : 'Cargar imagen'}
        </p>
      </div>

      {mensaje && (
        <div className="info-caja">
          <p>{mensaje}</p>
        </div>
      )}

      {previsualizacion && (
        <div className="resultado-animado">
          <div className="preview-imagen">
            <img src={previsualizacion} alt="Vista previa" />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Convertir a</label>
            <select
              value={formatoDestino}
              onChange={(e) => setFormatoDestino(e.target.value)}
              className="input-select"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
              <option value="bmp">BMP</option>
              <option value="tiff">TIFF</option>
            </select>
          </div>

          <button
            onClick={convertirImagen}
            disabled={procesando}
            className="boton-primario"
          >
            <RefreshCw size={20} />
            <span>{procesando ? 'Convirtiendo...' : 'Convertir Imagen'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ConvertidorDocumentos = () => {
  const [tipoConversion, setTipoConversion] = useState('txt-to-pdf');
  const [archivo, setArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef(null);

  const tiposConversion = [
    { id: 'txt-to-pdf', nombre: 'TXT a PDF', accept: '.txt' },
    { id: 'pdf-to-txt', nombre: 'PDF a TXT', accept: '.pdf' },
    { id: 'docx-to-txt', nombre: 'DOCX a TXT', accept: '.docx' }
  ];

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setMensaje('');
    }
  };

  const convertirDocumento = async () => {
    if (!archivo) return;

    setProcesando(true);
    setMensaje('Convirtiendo documento...');

    const formData = new FormData();
    formData.append('file', archivo);

    try {
      const response = await fetch(`${API_URL}/api/document/${tipoConversion}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const extension = tipoConversion.includes('pdf') ?
          (tipoConversion === 'txt-to-pdf' ? 'pdf' : 'txt') : 'txt';
        link.download = `convertido.${extension}`;

        link.click();
        window.URL.revokeObjectURL(url);
        setMensaje('¡Documento convertido exitosamente!');
      } else {
        setMensaje('Error al convertir el documento');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  const tipoActual = tiposConversion.find(t => t.id === tipoConversion);

  return (
    <div className="convertidor-seccion">
      <div className="grupo-input">
        <label className="etiqueta">Tipo de conversión</label>
        <select
          value={tipoConversion}
          onChange={(e) => {
            setTipoConversion(e.target.value);
            setArchivo(null);
            setMensaje('');
          }}
          className="input-select"
        >
          {tiposConversion.map(tipo => (
            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
          ))}
        </select>
      </div>

      <div className="zona-subida-pequena" onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          accept={tipoActual.accept}
          onChange={manejarArchivo}
          className="input-oculto"
        />
        <FileText size={48} className="icono-subida" />
        <p className="texto-subida-pequeno">
          {archivo ? archivo.name : `Cargar archivo ${tipoActual.accept}`}
        </p>
      </div>

      {mensaje && (
        <div className="info-caja">
          <p>{mensaje}</p>
        </div>
      )}

      {archivo && (
        <button
          onClick={convertirDocumento}
          disabled={procesando}
          className="boton-primario"
        >
          <RefreshCw size={20} />
          <span>{procesando ? 'Convirtiendo...' : 'Convertir Documento'}</span>
        </button>
      )}
    </div>
  );
};

const ConvertidorHojas = () => {
  const [tipoConversion, setTipoConversion] = useState('csv-to-excel');
  const [archivo, setArchivo] = useState(null);
  const [hojas, setHojas] = useState([]);
  const [hojaSeleccionada, setHojaSeleccionada] = useState('0');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef(null);

  const tiposConversion = [
    { id: 'csv-to-excel', nombre: 'CSV a Excel', accept: '.csv' },
    { id: 'excel-to-csv', nombre: 'Excel a CSV', accept: '.xlsx,.xls' },
    { id: 'to-pdf', nombre: 'Excel/CSV a PDF', accept: '.xlsx,.xls,.csv' }
  ];

  const manejarArchivo = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setMensaje('');

      if ((tipoConversion === 'excel-to-csv' || tipoConversion === 'to-pdf') &&
        (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(`${API_URL}/api/spreadsheet/get-sheets`, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            setHojas(data.sheets);
            setHojaSeleccionada('0');
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const convertirHoja = async () => {
    if (!archivo) return;

    setProcesando(true);
    setMensaje('Convirtiendo...');

    const formData = new FormData();
    formData.append('file', archivo);

    let endpoint = '';
    let filename = '';

    if (tipoConversion === 'csv-to-excel') {
      endpoint = `${API_URL}/api/spreadsheet/csv-to-excel`;
      filename = 'datos_convertidos.xlsx';
    } else if (tipoConversion === 'excel-to-csv') {
      formData.append('sheet_name', hojaSeleccionada);
      endpoint = `${API_URL}/api/spreadsheet/excel-to-csv`;
      filename = 'datos_convertidos.csv';
    } else {
      const fileType = archivo.name.endsWith('.csv') ? 'csv' : 'excel';
      formData.append('file_type', fileType);
      if (fileType === 'excel') {
        formData.append('sheet_name', hojaSeleccionada);
      }
      endpoint = `${API_URL}/api/spreadsheet/to-pdf`;
      filename = 'datos_convertidos.pdf';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        setMensaje('¡Archivo convertido exitosamente!');
      } else {
        setMensaje('Error al convertir el archivo');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  const tipoActual = tiposConversion.find(t => t.id === tipoConversion);

  return (
    <div className="convertidor-seccion">
      <div className="grupo-input">
        <label className="etiqueta">Tipo de conversión</label>
        <select
          value={tipoConversion}
          onChange={(e) => {
            setTipoConversion(e.target.value);
            setArchivo(null);
            setHojas([]);
            setMensaje('');
          }}
          className="input-select"
        >
          {tiposConversion.map(tipo => (
            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
          ))}
        </select>
      </div>

      <div className="zona-subida-pequena" onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          accept={tipoActual.accept}
          onChange={manejarArchivo}
          className="input-oculto"
        />
        <Table size={48} className="icono-subida" />
        <p className="texto-subida-pequeno">
          {archivo ? archivo.name : 'Cargar archivo'}
        </p>
      </div>

      {hojas.length > 0 && (
        <div className="grupo-input">
          <label className="etiqueta">Selecciona la hoja</label>
          <select
            value={hojaSeleccionada}
            onChange={(e) => setHojaSeleccionada(e.target.value)}
            className="input-select"
          >
            {hojas.map((hoja, index) => (
              <option key={index} value={index.toString()}>{hoja}</option>
            ))}
          </select>
        </div>
      )}

      {mensaje && (
        <div className="info-caja">
          <p>{mensaje}</p>
        </div>
      )}

      {archivo && (
        <button
          onClick={convertirHoja}
          disabled={procesando}
          className="boton-primario"
        >
          <RefreshCw size={20} />
          <span>{procesando ? 'Convirtiendo...' : 'Convertir'}</span>
        </button>
      )}
    </div>
  );
};



const CompresorImagen = () => {
  const [archivo, setArchivo] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState('');
  const [calidad, setCalidad] = useState(85);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tamañoOriginal, setTamañoOriginal] = useState(0);
  const [estadisticas, setEstadisticas] = useState(null);
  const inputRef = useRef(null);

  const formatearTamaño = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setArchivo(file);
      setTamañoOriginal(file.size);
      const reader = new FileReader();
      reader.onloadend = () => setPrevisualizacion(reader.result);
      reader.readAsDataURL(file);
      setMensaje('');
      setEstadisticas(null);
    }
  };

  const comprimirImagen = async () => {
    if (!archivo) return;

    setProcesando(true);
    setMensaje('Comprimiendo imagen...');

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('quality', calidad);

    try {
      const response = await fetch(`${API_URL}/api/image/compress`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const tamañoComprimido = response.headers.get('X-Compressed-Size');
        const ratioCompresion = response.headers.get('X-Compression-Ratio');

        setEstadisticas({
          original: tamañoOriginal,
          comprimido: parseInt(tamañoComprimido),
          ratio: parseFloat(ratioCompresion)
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'imagen_comprimida.jpg';
        link.click();
        window.URL.revokeObjectURL(url);

        setMensaje('¡Imagen comprimida exitosamente!');
      } else {
        setMensaje('Error al comprimir la imagen');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="seccion-herramienta">
      <div className="encabezado-herramienta">
        <Image size={32} className="icono-morado" />
        <h2 className="titulo-herramienta">Comprimir Imagen</h2>
      </div>

      <div className="formulario">
        <div className="zona-subida" onClick={() => inputRef.current?.click()}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={manejarArchivo}
            className="input-oculto"
          />
          <Image size={64} className="icono-subida" />
          <p className="texto-subida">
            {archivo ? archivo.name : 'Haz clic para cargar una imagen'}
          </p>
          <p className="texto-hint">PNG, JPG, WEBP, etc.</p>
        </div>

        {archivo && (
          <div className="info-caja">
            <p>Tamaño original: <span className="texto-destacado">{formatearTamaño(tamañoOriginal)}</span></p>
          </div>
        )}

        {previsualizacion && (
          <div className="resultado-animado">
            <div className="preview-imagen">
              <img src={previsualizacion} alt="Vista previa" />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">
                Calidad de compresión: <span className="texto-destacado">{calidad}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={calidad}
                onChange={(e) => setCalidad(parseInt(e.target.value))}
                className="input-range"
              />
              <div className="range-labels">
                <span className="range-label">Menor tamaño</span>
                <span className="range-label">Mayor calidad</span>
              </div>
            </div>

            <button
              onClick={comprimirImagen}
              disabled={procesando}
              className="boton-primario"
            >
              <Download size={20} />
              <span>{procesando ? 'Comprimiendo...' : 'Comprimir y Descargar'}</span>
            </button>

            {mensaje && (
              <div className="info-caja">
                <p>{mensaje}</p>
              </div>
            )}

            {estadisticas && (
              <div className="estadisticas-compresion">
                <h3 className="stats-titulo">Resultados de Compresión</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Original</span>
                    <span className="stat-value">{formatearTamaño(estadisticas.original)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Comprimido</span>
                    <span className="stat-value">{formatearTamaño(estadisticas.comprimido)}</span>
                  </div>
                  <div className="stat-item destacado">
                    <span className="stat-label">Reducción</span>
                    <span className="stat-value">{estadisticas.ratio}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DescargadorVideo = () => {
  const [url, setUrl] = useState('');
  const [formato, setFormato] = useState('mp4');
  const [infoVideo, setInfoVideo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [cargandoInfo, setCargandoInfo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const obtenerInfoVideo = async () => {
    if (!url) {
      setMensaje('Por favor ingresa una URL');
      return;
    }

    setCargandoInfo(true);
    setMensaje('Obteniendo información del video...');

    const formData = new FormData();
    formData.append('url', url);

    try {
      const response = await fetch(`${API_URL}/api/video/info`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setInfoVideo(data);
        setMensaje('');
      } else {
        setMensaje('Error al obtener información del video');
        setInfoVideo(null);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      setInfoVideo(null);
      console.error(error);
    } finally {
      setCargandoInfo(false);
    }
  };

  const descargarVideo = async () => {
    if (!url) return;

    setProcesando(true);
    setMensaje(`Descargando ${formato === 'mp4' ? 'video' : 'audio'}...`);

    const formData = new FormData();
    formData.append('url', url);
    formData.append('format_type', formato);

    try {
      const response = await fetch(`${API_URL}/api/video/download`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `video_descargado.${formato}`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        setMensaje(`¡${formato === 'mp4' ? 'Video' : 'Audio'} descargado exitosamente!`);
      } else {
        setMensaje('Error al descargar el video');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  const formatearDuracion = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="seccion-herramienta">
      <div className="encabezado-herramienta">
        <Download size={32} className="icono-morado" />
        <h2 className="titulo-herramienta">Descargar Video</h2>
      </div>

      <div className="formulario">
        <div className="grupo-input">
          <label className="etiqueta">URL del video (YouTube, Vimeo, etc.)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setInfoVideo(null);
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input-texto"
          />
        </div>

        <div className="grupo-input">
          <label className="etiqueta">Formato de descarga</label>
          <select value={formato} onChange={(e) => setFormato(e.target.value)} className="input-select">
            <option value="mp4">Video (MP4)</option>
            <option value="mp3">Solo Audio (MP3)</option>
          </select>
        </div>

        <button
          onClick={obtenerInfoVideo}
          disabled={!url || cargandoInfo}
          className="boton-secundario"
        >
          <Play size={20} />
          <span>{cargandoInfo ? 'Cargando...' : 'Ver información'}</span>
        </button>

        {mensaje && (
          <div className="info-caja">
            <p>{mensaje}</p>
          </div>
        )}

        {infoVideo && (
          <div className="resultado-animado">
            <div className="video-info-contenedor">
              {infoVideo.thumbnail && (
                <img src={infoVideo.thumbnail} alt="Miniatura" className="video-thumbnail" />
              )}
              <div className="video-detalles">
                <h3 className="video-titulo">{infoVideo.title}</h3>
                <p className="video-meta">
                  Canal: <span className="texto-destacado">{infoVideo.uploader}</span>
                </p>
                {infoVideo.duration > 0 && (
                  <p className="video-meta">
                    Duración: <span className="texto-destacado">{formatearDuracion(infoVideo.duration)}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={descargarVideo}
              disabled={procesando}
              className="boton-primario"
            >
              <Download size={20} />
              <span>{procesando ? 'Descargando...' : `Descargar ${formato === 'mp4' ? 'Video' : 'Audio'}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;