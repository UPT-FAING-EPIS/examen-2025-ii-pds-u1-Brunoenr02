-- ============================================================================
-- SCRIPT DE DATOS INICIALES - BABYSITTER RENTAL SYSTEM
-- ============================================================================
-- Ejecutar DESPUÉS de crear las tablas con el esquema bd.txt

-- ============================================================================
-- USUARIOS DE PRUEBA
-- ============================================================================

-- Familias de prueba
INSERT INTO Usuarios (Nombre, Apellido, Email, Password, Telefono, Direccion, Ciudad, Rol, FechaRegistro) VALUES
('Juan', 'Pérez', 'familia@test.com', 'password123', '555-0101', 'Av. Principal 123', 'Lima', 'Familia', NOW()),
('María', 'González', 'familia2@test.com', 'password123', '555-0102', 'Jr. Los Olivos 456', 'Lima', 'Familia', NOW());

-- Niñeras de prueba
INSERT INTO Usuarios (Nombre, Apellido, Email, Password, Telefono, Direccion, Ciudad, Rol, FechaRegistro) VALUES
('Ana', 'Rodríguez', 'ninera@test.com', 'password123', '555-0201', 'Calle Luna 789', 'Lima', 'Ninera', NOW()),
('Sofia', 'Martínez', 'ninera2@test.com', 'password123', '555-0202', 'Av. Sol 321', 'Lima', 'Ninera', NOW()),
('Carmen', 'López', 'ninera3@test.com', 'password123', '555-0203', 'Jr. Estrella 654', 'Arequipa', 'Ninera', NOW());

-- ============================================================================
-- PERFILES DE NIÑERAS
-- ============================================================================

INSERT INTO Nineras (UsuarioID, Biografia, AnosExperiencia, TarifaPorHora, CalificacionPromedio) VALUES
((SELECT UsuarioID FROM Usuarios WHERE Email = 'ninera@test.com'), 
 'Especialista en cuidado infantil con certificación en primeros auxilios. Experiencia con bebés y niños pequeños.', 
 5, 25.00, 4.8),
 
((SELECT UsuarioID FROM Usuarios WHERE Email = 'ninera2@test.com'), 
 'Educadora preescolar con 3 años de experiencia. Actividades recreativas y apoyo en tareas escolares.', 
 3, 20.00, 4.5),
 
((SELECT UsuarioID FROM Usuarios WHERE Email = 'ninera3@test.com'), 
 'Niñera profesional con experiencia en cuidado de niños con necesidades especiales. Muy paciente y cariñosa.', 
 7, 30.00, 4.9);

-- ============================================================================
-- RESERVAS DE EJEMPLO
-- ============================================================================

INSERT INTO Reservas (FamiliaUsuarioID, NineraID, InicioServicio, FinServicio, CostoTotal, Estado, NotasParaNinera, FechaCreacion) VALUES
((SELECT UsuarioID FROM Usuarios WHERE Email = 'familia@test.com'),
 (SELECT NineraID FROM Nineras n JOIN Usuarios u ON n.UsuarioID = u.UsuarioID WHERE u.Email = 'ninera@test.com'),
 '2025-09-25 09:00:00', '2025-09-25 17:00:00', 200.00, 'Completada', 'Cuidar a 2 niños de 5 y 8 años', NOW()),

((SELECT UsuarioID FROM Usuarios WHERE Email = 'familia@test.com'),
 (SELECT NineraID FROM Nineras n JOIN Usuarios u ON n.UsuarioID = u.UsuarioID WHERE u.Email = 'ninera2@test.com'),
 '2025-09-28 10:00:00', '2025-09-28 15:00:00', 100.00, 'Confirmada', 'Ayuda con tareas y juegos', NOW()),

((SELECT UsuarioID FROM Usuarios WHERE Email = 'familia2@test.com'),
 (SELECT NineraID FROM Nineras n JOIN Usuarios u ON n.UsuarioID = u.UsuarioID WHERE u.Email = 'ninera@test.com'),
 '2025-09-30 08:00:00', '2025-09-30 18:00:00', 250.00, 'Solicitada', 'Cuidado durante todo el día', NOW());

-- ============================================================================
-- RESEÑAS DE EJEMPLO
-- ============================================================================

INSERT INTO Resenas (ReservaID, AutorUsuarioID, NineraResenadaID, Calificacion, Comentario, FechaResena) VALUES
((SELECT ReservaID FROM Reservas WHERE FamiliaUsuarioID = (SELECT UsuarioID FROM Usuarios WHERE Email = 'familia@test.com') AND Estado = 'Completada' LIMIT 1),
 (SELECT UsuarioID FROM Usuarios WHERE Email = 'familia@test.com'),
 (SELECT NineraID FROM Nineras n JOIN Usuarios u ON n.UsuarioID = u.UsuarioID WHERE u.Email = 'ninera@test.com'),
 5, 'Excelente niñera! Muy profesional y cariñosa con los niños. La recomiendo 100%.', NOW());

-- ============================================================================
-- ACTUALIZAR CALIFICACIONES PROMEDIO DE NIÑERAS
-- ============================================================================

UPDATE Nineras SET CalificacionPromedio = (
    SELECT AVG(Calificacion) 
    FROM Resenas 
    WHERE NineraResenadaID = Nineras.NineraID
) WHERE NineraID IN (
    SELECT DISTINCT NineraResenadaID FROM Resenas
);

-- ============================================================================
-- VERIFICACIÓN DE DATOS
-- ============================================================================

-- Contar registros creados
SELECT 
    'Usuarios' as Tabla, COUNT(*) as Total FROM Usuarios
UNION ALL
SELECT 
    'Niñeras' as Tabla, COUNT(*) as Total FROM Nineras
UNION ALL
SELECT 
    'Reservas' as Tabla, COUNT(*) as Total FROM Reservas
UNION ALL
SELECT 
    'Reseñas' as Tabla, COUNT(*) as Total FROM Resenas;

-- Mostrar datos de prueba
SELECT 
    CONCAT(u.Nombre, ' ', u.Apellido) as NombreCompleto,
    u.Email,
    u.Rol,
    n.TarifaPorHora,
    n.CalificacionPromedio
FROM Usuarios u
LEFT JOIN Nineras n ON u.UsuarioID = n.UsuarioID
ORDER BY u.Rol, u.Nombre;