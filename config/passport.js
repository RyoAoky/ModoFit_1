const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { sequelize } = require('../database/conexionsqualize');
const { QueryTypes } = require('sequelize');

module.exports = function (passport) {
    // MODO DE PRUEBA: Permite iniciar sesión con cualquier email y contraseña
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            },
            async (email, password, done) => {
                // Crear un usuario de prueba con datos simulados
                const mockUser = {
                    UsuarioID: 1,
                    Email: email,
                    Nombre: 'Usuario',
                    Apellido: 'Prueba',
                    PasswordHash: 'mock-hash',
                    FechaRegistro: new Date(),
                    Estado: 'Activo',
                    TipoUsuario: 'Cliente',
                    UltimoLogin: new Date()
                };
                
                // Siempre devuelve el usuario simulado (aceptando cualquier credencial)
                return done(null, mockUser);
            }
        )
    );
    
    /* CÓDIGO ORIGINAL COMENTADO:
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            },
            async (email, password, done) => {
                try {
                    // Get user by email using stored procedure
                    const users = await sequelize.query(
                        'EXEC sp_GetUserByEmail @Email = :email',
                        {
                            type: QueryTypes.SELECT,
                            replacements: { email }
                        }
                    );

                    if (!users || users.length === 0) {
                        return done(null, false, { message: 'Ese correo electrónico no está registrado' });
                    }

                    const user = users[0];

                    // Compare password
                    const isMatch = await bcrypt.compare(password, user.PasswordHash);
                    if (!isMatch) {
                        return done(null, false, { message: 'Contraseña incorrecta' });
                    }

                    return done(null, user);
                } catch (error) {
                    console.error('Error en estrategia local de Passport:', error);
                    return done(error);
                }
            }
        )
    );*/

    passport.serializeUser((user, done) => {
        done(null, user.UsuarioID);
    });

    // MODO DE PRUEBA: Deserializa siempre devolviendo un usuario ficticio
    passport.deserializeUser(async (id, done) => {
        // Crear un usuario de prueba consistente para la deserialización
        const mockUser = {
            UsuarioID: id,
            Email: 'usuario@prueba.com',
            Nombre: 'Usuario',
            Apellido: 'Prueba',
            PasswordHash: 'mock-hash',
            FechaRegistro: new Date(),
            Estado: 'Activo',
            TipoUsuario: 'Cliente',
            UltimoLogin: new Date()
        };
        
        // Devolver el usuario simulado
        done(null, mockUser);
    });
    
    /* CÓDIGO ORIGINAL COMENTADO:
    passport.deserializeUser(async (id, done) => {
        try {
            const users = await sequelize.query(
                'EXEC sp_GetUserById @UsuarioID = :id',
                {
                    type: QueryTypes.SELECT,
                    replacements: { id }
                }
            );

            if (!users || users.length === 0) {
                return done(new Error('Usuario no encontrado durante la deserialización'));
            }

            done(null, users[0]);
        } catch (error) {
            console.error('Error en deserialización de Passport:', error);
            done(error);
        }
    })*/
};