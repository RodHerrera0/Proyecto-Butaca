import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// jsdom no implementa la reproducción de video.
window.HTMLMediaElement.prototype.play = () => Promise.resolve()
