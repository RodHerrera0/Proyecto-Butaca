import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

// Pruebas con sesión iniciada: el backend se simula con un fetch falso.

vi.mock('./lib/detector.js', () => ({
  MAXIMO_PERSONAS: 6,
  cargarModelos: vi.fn(() => Promise.resolve({})),
  detectarEmocion: vi.fn(),
  detectarAnimosGrupo: vi.fn(),
}))

vi.mock('./lib/sesion.js', () => ({
  useSesion: () => ({
    sesion: { access_token: 'token-de-prueba', user: { id: 'usuario-1' } },
    usuario: { nombre: 'Rodrigo', correo: 'rodrigo@ejemplo.com', avatar: null },
    cargando: false,
    disponible: true,
    entrar: vi.fn(),
    salir: vi.fn(),
  }),
}))

const RECOMENDACIONES = [
  {
    tmdbId: 10,
    mediaType: 'MOVIE',
    title: 'Película real',
    posterPath: null,
    overview: 'Sinopsis real',
    year: 2024,
    voteAverage: 7.5,
    genres: ['35'],
  },
  { tmdbId: 20, mediaType: 'TV', title: 'Serie real', posterPath: null, overview: '', year: 2023, voteAverage: 8, genres: [] },
]

let respuestas
let fetchFalso

function responder(estado, cuerpo) {
  return Promise.resolve({
    ok: estado < 400,
    status: estado,
    json: () => Promise.resolve(cuerpo),
  })
}

// Busca la respuesta por "MÉTODO ruta" (sin la query)
function llamadas(clave) {
  return fetchFalso.mock.calls.filter(([url, opciones]) => `${opciones.method} ${url.split('?')[0]}` === clave)
}

function renderEn(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  respuestas = {
    'GET /api/favorites': () => responder(200, []),
    'GET /api/recommendations': () => responder(200, RECOMENDACIONES),
    'POST /api/favorites': () =>
      responder(201, {
        id: 'fav-1',
        tmdbId: 10,
        mediaType: 'MOVIE',
        title: 'Película real',
        posterPath: null,
        createdAt: '2026-11-05T10:00:00.000Z',
      }),
    'POST /api/moods': () => responder(201, { id: 'animo-1' }),
    'GET /api/dashboard': () =>
      responder(200, {
        historial: [{ emocion: 'happy', confianza: 0.9, fecha: '2026-11-05T10:00:00.000Z' }],
        porEmocion: { happy: 1 },
        porTipo: { MOVIE: 5, TV: 5 },
        porGenero: [{ id: 35, nombre: 'Comedia', total: 4 }],
      }),
  }
  fetchFalso = vi.fn((url, opciones) => {
    const clave = `${opciones.method} ${url.split('?')[0]}`
    return respuestas[clave]()
  })
  vi.stubGlobal('fetch', fetchFalso)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('con sesión iniciada', () => {
  it('muestra recomendaciones reales de TMDB sin el aviso de demostración', async () => {
    renderEn('/recomendaciones')

    expect(await screen.findByRole('heading', { name: 'Para tu ánimo de hoy · Feliz' })).toBeTruthy()
    expect(screen.getAllByText('Película real').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Series' })).toBeTruthy()
    expect(screen.queryByTestId('aviso-demo')).toBeNull()

    const [url, opciones] = llamadas('GET /api/recommendations')[0]
    expect(url).toContain('mood=happy')
    expect(opciones.headers.Authorization).toBe('Bearer token-de-prueba')
  })

  it('cada chip pide al backend las recomendaciones de esa emoción', async () => {
    renderEn('/recomendaciones')
    await screen.findByRole('heading', { name: 'Para tu ánimo de hoy · Feliz' })

    const filtros = screen.getByRole('group', { name: 'Filtrar por ánimo' })
    expect(within(filtros).queryByRole('button', { name: 'Todos' })).toBeNull()
    fireEvent.click(screen.getByTestId('filtro-animo-sad'))

    expect(await screen.findByRole('heading', { name: 'Para tu ánimo de hoy · Triste' })).toBeTruthy()
    expect(llamadas('GET /api/recommendations').at(-1)[0]).toContain('mood=sad')
  })

  it('guarda una favorita en el backend con los datos de TMDB', async () => {
    renderEn('/recomendaciones')
    await screen.findByRole('heading', { name: 'Para tu ánimo de hoy · Feliz' })

    fireEvent.click(screen.getAllByRole('button', { name: 'Agregar Película real a favoritas' })[0])

    await waitFor(() => expect(llamadas('POST /api/favorites')).toHaveLength(1))
    expect(JSON.parse(llamadas('POST /api/favorites')[0][1].body)).toEqual({
      tmdbId: 10,
      mediaType: 'MOVIE',
      title: 'Película real',
      posterPath: null,
    })
  })

  it('carga las favoritas guardadas y las borra por su id de registro', async () => {
    respuestas['GET /api/favorites'] = () =>
      responder(200, [
        { id: 'fav-9', tmdbId: 30, mediaType: 'TV', title: 'Guardada', posterPath: null, createdAt: '2026-11-01T10:00:00.000Z' },
      ])
    respuestas['DELETE /api/favorites/fav-9'] = () => responder(204, null)
    renderEn('/favoritas')

    fireEvent.click(await screen.findByRole('button', { name: 'Quitar Guardada de favoritas' }))

    expect(await screen.findByText('Todavía no guardaste nada')).toBeTruthy()
    expect(llamadas('DELETE /api/favorites/fav-9')).toHaveLength(1)
  })

  it('si falla guardar la favorita, avisa y vuelve a lo que dice el servidor', async () => {
    respuestas['POST /api/favorites'] = () => responder(500, { error: 'Error interno' })
    renderEn('/recomendaciones')
    await screen.findByRole('heading', { name: 'Para tu ánimo de hoy · Feliz' })

    fireEvent.click(screen.getAllByRole('button', { name: 'Agregar Película real a favoritas' })[0])

    expect((await screen.findByTestId('aviso-global')).textContent).toContain('No pudimos actualizar tus favoritas')
  })

  it('envía al backend solo la emoción y la confianza del ánimo', async () => {
    renderEn('/detectar')
    fireEvent.change(screen.getByTestId('selector-animo-manual'), { target: { value: 'sad' } })

    await waitFor(() => expect(llamadas('POST /api/moods')).toHaveLength(1))
    expect(JSON.parse(llamadas('POST /api/moods')[0][1].body)).toEqual({ mood: 'sad', confidence: null })
  })

  it('no guarda en el historial un ánimo simulado', async () => {
    renderEn('/detectar?simular=happy')
    await screen.findByTestId('resultado-emocion')
    expect(llamadas('POST /api/moods')).toHaveLength(0)
  })

  it('el tablero dibuja las gráficas con los datos del backend', async () => {
    renderEn('/tablero')

    expect(await screen.findByTestId('grafica-tiempo')).toBeTruthy()
    expect(screen.getByTestId('grafica-generos').textContent).toContain('Comedia')
    expect(screen.getByTestId('grafica-tipos').textContent).toContain('50%')
    expect(screen.queryByTestId('aviso-demo')).toBeNull()
  })

  it('el tablero invita a detectar el ánimo si todavía no hay historial', async () => {
    respuestas['GET /api/dashboard'] = () =>
      responder(200, { historial: [], porEmocion: {}, porTipo: { MOVIE: 0, TV: 0 }, porGenero: [] })
    renderEn('/tablero')

    expect(await screen.findByTestId('estado-vacio')).toBeTruthy()
  })

  it('el menú muestra al usuario de la sesión', () => {
    renderEn('/tablero')
    fireEvent.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    expect(screen.getByText('Rodrigo')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy()
  })
})
