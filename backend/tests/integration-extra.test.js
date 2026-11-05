// backend/tests/integration-extra.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Pruebas de Integración Adicionales - Proyecto Butaca', () => {

  it('Debería retornar un código de error al consultar recomendaciones con parámetros no válidos', async () => {
    const response = await request(app)
      .get('/api/recomendaciones?animo=parametro_invalido_xyz');
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('Debería denegar el acceso al endpoint de favoritos si no se provee autenticación', async () => {
    const response = await request(app)
      .get('/api/favoritas');
    
    expect(response.status).toBe(401);
  });

});