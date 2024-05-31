//npm install express express-handlebars express-fileupload jsonwebtoken pg nodemon
//npm uninstall

const express = require('express');
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const jwt = require('jsonwebtoken');
const { agregarUsuario, mostrarUsuario, mostrarTodosLosUsuarios, editarUsuario, borrarUsuario, mostrarUsuarioPorEmail } = require("./consulta");
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const secretKey = 'V4lito';

app.listen(PORT,() => {
    console.log(`El servidor está inicializado en el puerto ${PORT}`);
});

app.use(express.json());
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({ extended: true }));

//Configuración de handlebars 
app.engine("handlebars",
exphbs.engine({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    defaultLayout: 'main',
    helpers: {
        mensaje: function(){
            return "Skate Park";
        }
    } 
})
);

app.set("view engine", "handlebars");

app.get("/", async (req, res) => {
    try {
        const participantes = await mostrarTodosLosUsuarios();
        res.render("index", { usuarios: participantes });
    } catch (error) {
        console.error('Error al obtener participantes:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get("/registro", (req, res) => {
    res.render("registro");
});

app.get("/datos", async (req, res) => {
    try {
        const usuario = await mostrarUsuarioPorEmail(req.userEmail);
        
        res.render("datos", { usuario });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/admin", async (req, res) => {
    //res.render("admin");
    try {
        const usuarios = await mostrarTodosLosUsuarios()
        res.render('Admin', { usuarios })
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
});

// Configuración de express-fileupload
app.use(expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "El peso del archivo que intentas subir supera el limite permitido.",
}));

// Ruta para registro y subida de fotos
app.post("/registro", async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No se subió ningún archivo.');
        }

        const { foto } = req.files;
        const ruta_archivo = __dirname + "/assets/img/" + foto.name;

        foto.mv(ruta_archivo, async (err) => {
            if (err) {
                console.error('Error al mover el archivo:', err);
                return res.status(500).send(err);
            }

            const data = {
                email: req.body.email,
                nombre: req.body.nombre,
                password: req.body.password,
                anos_experiencia: req.body.anos_experiencia,
                especialidad: req.body.especialidad,
                foto: "/assets/img/" + foto.name,
                estado: false
            };

            try {
                const result = await agregarUsuario(data);
                res.redirect("/");
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                res.status(500).send("Algo salió mal 😢...");
            }
        });

    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).send("Algo salió mal 🤷‍♀️ al cargar el archivo");
    }
});

// Ruta para actualizar datos
app.put("/datos", async (req, res) => {
    const { email,nombre,password,anos_experiencia,especialidad } = req.body;

    try {
        const usuario = await editarUsuario(email,nombre,password,anos_experiencia,especialidad);
        res.status(200).send(usuario);
        //res.redirect("/datos");
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).send("Algo salió mal al actualizar los datos");
    }    
});

// Ruta para eliminar usuario
app.delete('/eliminar/:email', async (req,res) => {
    
    try {
        const { email } = req.params;
        const result = await eliminarCuenta(email);
        res.sendStatus(200).send(result);
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).send("Algo salió mal al eliminar los datos");
    }
})

// sin Signature Verified
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGVyaWEudG9ycmVhbGJhQGdtYWlsLmNvbSIsImlhdCI6MTcxNjg0MzU3MX0.3QzfIiDWuyItiaepyt-S2cUf0P3KVv6KGrzk79IgdrE

//con Signature Verified
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGVyaWEudG9ycmVhbGJhQGdtYWlsLmNvbSIsImlhdCI6MTcxNjg0MzU3MX0.3UO4IKKrEO1OfLb4iOhZxFg93g8xQS0_3s9fs8WxkBg

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar las credenciales y generar el token JWT si el inicio de sesión es exitoso
    const success = email === 'valeria.torrealba@gmail.com' && password === '123456';
    if (success) {
        const token = jwt.sign({ email }, secretKey);

        // Redirigir al usuario a la página de "datos"
        res.redirect('/datos');
    } else {
        // Si las credenciales son incorrectas, enviar una respuesta de error
        res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
});

