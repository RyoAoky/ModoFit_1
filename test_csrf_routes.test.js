// Pruebas automáticas para CSRF en rutas de venta y usuario
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const ventaRoutes = require('./routes/venta');
const usuarioRoutes = require('./routes/usuario');

// App de prueba para rutas de venta
const appVenta = express();
appVenta.use(express.urlencoded({ extended: true }));
appVenta.use(express.json());
appVenta.use(cookieParser());
appVenta.use('/venta', ventaRoutes);

// App de prueba para rutas de usuario
const appUsuario = express();
appUsuario.use(express.urlencoded({ extended: true }));
appUsuario.use(express.json());
appUsuario.use(cookieParser());
appUsuario.use('/usuario', usuarioRoutes);

describe('CSRF en rutas de venta (csrf-csrf)', () => {
  it('Debe rechazar POST sin token CSRF', async () => {
    const res = await request(appVenta)
      .post('/venta/procesar-pago')
      .send({});
    expect(res.status).toBe(403);
  });
});

describe('CSRF en rutas de usuario (csrf-sync)', () => {
  it('Debe rechazar POST sin token CSRF', async () => {
    const res = await request(appUsuario)
      .post('/usuario/login')
      .send({});
    expect(res.status).toBe(403);
  });
});

// NOTA: Estas pruebas solo verifican el rechazo sin token. Para pruebas completas, se debe simular obtención e inclusión del token CSRF.
