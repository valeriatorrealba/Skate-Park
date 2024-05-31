const { Pool } = require("pg");

const config = {
    host: "localhost",
    port: 5432,
    database: "skatepark",
    user: "postgres",
    password: "0000",
};

const pool = new Pool(config);

const agregarUsuario = async(data) => {
    const consulta = {
        text: "insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1, $2, $3, $4, $5, $6, false) returning *",
        values: [data.email, data.nombre, data.password, data.anos_experiencia, data.especialidad, data.foto]
    }
    const result = await pool.query(consulta)
    return result.rows[0];
}

const mostrarUsuario = async (id) => {
    const result = await pool.query("SELECT * FROM skaters WHERE id=$1", [id]);
    return result.rows[0];
};
const mostrarTodosLosUsuarios = async() =>{
    const result = await pool.query("select * from skaters");
    return result.rows;
}

const mostrarUsuarioPorEmail = async (email) => {
    const result = await pool.query("SELECT * FROM skaters WHERE email=$1", [email]);
    return result.rows[0];
};

const editarUsuario = async (email, datos) => {
    const consulta = {
        text: "UPDATE skaters SET email=$1, nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5, WHERE email=$6 RETURNING *",
        values: [datos.email, datos.nombre, datos.password, datos.anos_experiencia, datos.especialidad, email]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
};

const borrarUsuario = async(email) =>{
    const consulta = {
        text:"delete from skaters where email = $1 returning *",
        values:[email],
    }
    const result = await pool.query(consulta);
    return result.rows[0];
}
module.exports = { agregarUsuario, mostrarUsuario, mostrarTodosLosUsuarios, editarUsuario, borrarUsuario, mostrarUsuarioPorEmail};