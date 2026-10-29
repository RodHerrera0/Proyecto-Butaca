import { Camera, Hand, ImageOff, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LogoButaca from '../components/LogoButaca.jsx'
import './Consentimiento.css'

// TEXTO PROVISIONAL: Luis entregará la redacción definitiva del consentimiento.
const PUNTOS = [
  {
    Icono: Camera,
    titulo: 'Para qué',
    texto:
      'Miramos tu expresión para adivinar cómo te sientes (feliz, triste, sorprendido…) y recomendarte películas y series acordes a tu ánimo.',
  },
  {
    Icono: Lock,
    titulo: 'Solo un instante',
    texto: 'Analizamos tu cara una sola vez, cuando presionas "Analizar", y luego la cámara se apaga.',
  },
  {
    Icono: ImageOff,
    titulo: 'Tu imagen no sale de tu dispositivo',
    texto: 'Nunca la guardamos ni la enviamos a ningún lado. Solo nos quedamos con el resultado (por ejemplo, "Feliz, 87%").',
  },
  {
    Icono: Hand,
    titulo: 'Es opcional',
    texto: 'Si prefieres no usar la cámara, puedes elegir tu ánimo a mano.',
  },
]

export default function Consentimiento({ onDecidir }) {
  const navigate = useNavigate()

  function decidir(acepta) {
    onDecidir(acepta ? 'aceptado' : 'rechazado')
    navigate('/detectar')
  }

  return (
    <div className="pagina consentimiento">
      <section className="consentimiento__tarjeta tarjeta" aria-labelledby="consentimiento-titulo">
        <LogoButaca tamano={40} className="consentimiento__logo" />
        <h1 id="consentimiento-titulo" className="consentimiento__titulo">
          Uso de la cámara
        </h1>
        <p className="consentimiento__intro">Antes de empezar, queremos contarte cómo usamos tu cámara:</p>
        <ul className="consentimiento__puntos">
          {PUNTOS.map(({ Icono, titulo, texto }) => (
            <li key={titulo} className="consentimiento__punto">
              <span className="consentimiento__icono" aria-hidden="true">
                <Icono size={20} />
              </span>
              <span>
                <strong>{titulo}:</strong> {texto}
              </span>
            </li>
          ))}
        </ul>
        <div className="consentimiento__acciones">
          <button type="button" className="boton boton-primario" data-testid="boton-acepto" onClick={() => decidir(true)}>
            Acepto
          </button>
          <button
            type="button"
            className="boton boton-secundario"
            data-testid="boton-no-acepto"
            onClick={() => decidir(false)}
          >
            No acepto
          </button>
        </div>
      </section>
    </div>
  )
}
