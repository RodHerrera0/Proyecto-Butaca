import { useNavigate } from 'react-router-dom'

// TEXTO PROVISIONAL: Luis entregará la redacción definitiva del consentimiento.
export default function Consentimiento({ onDecidir }) {
  const navigate = useNavigate()

  function decidir(acepta) {
    onDecidir(acepta ? 'aceptado' : 'rechazado')
    navigate('/detectar')
  }

  return (
    <>
      <h1>Uso de la cámara</h1>
      <p>Antes de empezar, queremos contarte cómo usamos tu cámara:</p>
      <ul>
        <li>
          <strong>Para qué:</strong> miramos tu expresión para adivinar cómo te sientes (feliz, triste, sorprendido…) y
          recomendarte películas y series acordes a tu ánimo.
        </li>
        <li>
          <strong>Solo un instante:</strong> analizamos tu cara una sola vez, cuando presionas "Analizar", y luego la
          cámara se apaga.
        </li>
        <li>
          <strong>Tu imagen no sale de tu dispositivo:</strong> nunca la guardamos ni la enviamos a ningún lado. Solo
          nos quedamos con el resultado (por ejemplo, "Feliz, 87%").
        </li>
        <li>
          <strong>Es opcional:</strong> si prefieres no usar la cámara, puedes elegir tu ánimo a mano.
        </li>
      </ul>
      <div className="acciones">
        <button type="button" data-testid="boton-acepto" onClick={() => decidir(true)}>
          Acepto
        </button>
        <button type="button" data-testid="boton-no-acepto" onClick={() => decidir(false)}>
          No acepto
        </button>
      </div>
    </>
  )
}
