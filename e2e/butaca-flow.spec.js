// e2e/butaca-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Batería E2E Completa - Proyecto Butaca', () => {

  test('1. Debería mostrar estado de carga en recomendaciones usando simulación', async ({ page }) => {
    await page.goto('/recomendaciones?simular=cargando');
    const loader = page.locator('[data-testid="estado-cargando"]');
    await expect(loader).toBeVisible();
    await expect(loader).toHaveAttribute('aria-busy', 'true');
  });

  test('2. Debería manejar estados de error correctamente en recomendaciones', async ({ page }) => {
    await page.goto('/recomendaciones?simular=error');
    const errorBox = page.locator('[data-testid="estado-error"]');
    await expect(errorBox).toBeVisible();
  });

  test('3. Debería permitir la detección de emoción simulada (happy)', async ({ page }) => {
    await page.goto('/detectar?simular=happy');
    const avisoSimulacion = page.locator('[data-testid="aviso-simulacion"]');
    await expect(avisoSimulacion).toBeVisible();
    
    const resultadoEmocion = page.locator('[data-testid="resultado-emocion"]');
    await expect(resultadoEmocion).toBeVisible();
  });

  test('4. Debería renderizar los botones de login OAuth correctamente', async ({ page }) => {
    await page.goto('/login');
    const btnGoogle = page.locator('[data-testid="boton-login-google"]');
    const btnGithub = page.locator('[data-testid="boton-login-github"]');
    
    await expect(btnGoogle).toBeVisible();
    await expect(btnGithub).toBeVisible();
  });

  test('5. Debería permitir interactuar con los chips de filtro de ánimo', async ({ page }) => {
    await page.goto('/recomendaciones');
    const filtroHappy = page.locator('[data-testid="filtro-animo-happy"]');
    
    // Esperar a que el chip sea visible en el DOM antes de interactuar
    await filtroHappy.waitFor({ state: 'visible' });
    await filtroHappy.click();
    
    // Validar mediante el atributo de accesibilidad aria-pressed
    await expect(filtroHappy).toHaveAttribute('aria-pressed', 'true');
  });

});