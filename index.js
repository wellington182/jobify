const express = require( 'express' );
const app = express();

const bodyParser = require( 'body-parser' );

const sqlite = require( 'sqlite' );
const sqlite3 = require( 'sqlite3' );

const dbConnection = sqlite.open( { filename: 'banco.sqlite', driver: sqlite3.Database } );

app.set( 'view engine', 'ejs' );

app.use( express.static( 'public' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );

app.get( '/', async( req, res, next ) => {
    const db = await dbConnection;

    const categoriasDB = await db.all( 'SELECT * FROM categorias' );
    const vagas = await db.all( 'SELECT * FROM vagas' );
    
    const categorias = categoriasDB.map( cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id )
        }
    } )

    res.render( 'home', {
        categorias,
    } );
} );

app.get( '/vaga/:id', async( req, res, next ) => {
    const db = await dbConnection;

    const vaga = await db.get( 'SELECT * FROM vagas WHERE id = ' + req.params.id );

    res.render( 'vaga', {
        vaga
    } );
} );

app.get( '/admin', ( req, res, next ) => {
    res.render( 'admin/home' );
} );

app.get( '/admin/vagas', async( req, res, next ) => {
    const db = await dbConnection;
   
    const vagas = await db.all( 'SELECT * FROM vagas' );

    res.render( 'admin/vagas', {
        vagas
    } );
} );

app.get( '/admin/vagas/nova', async( req, res, next ) => {
    const db = await dbConnection;

    const categorias = await db.all( 'SELECT * FROM categorias' );
    res.render( 'admin/nova-vaga', {
        categorias
    } );
} );

app.post( '/admin/vagas', async( req, res, next ) => {
    const db = await dbConnection;

    const { titulo, descricao, categoria } = req.body;

    await db.run( `INSERT INTO vagas( categoria, titulo, descricao ) VALUES( ${categoria}, '${titulo}', '${descricao}' )` );
    res.redirect( '/admin/vagas' );
} );

app.get( '/admin/vagas/editar/:id', async( req, res, next ) => {
    const db = await dbConnection;

    const categorias = await db.all( 'SELECT * FROM categorias' );
    const vaga = await db.get( 'SELECT * FROM vagas WHERE id = ' + req.params.id );

    res.render( 'admin/editar-vaga', {
        categorias,
        vaga
    } );
} );

app.post( '/admin/vagas/editar/:id', async( req, res, next ) => {
    const db = await dbConnection;

    const { titulo, descricao, categoria } = req.body;
    const { id } = req.params;

    await db.run( `UPDATE vagas SET categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' WHERE id = ${id}` );
    res.redirect( '/admin/vagas' );
} );

app.get( '/admin/vagas/delete/:id', async( req, res, next ) => {
    const db = await dbConnection;
    
    await db.run( 'DELETE FROM vagas WHERE id = ' + req.params.id );

    res.redirect( '/admin/vagas' );
} );

app.get( '/admin/categorias', async( req, res, next ) => {
    const db = await dbConnection;
   
    const categorias = await db.all( 'SELECT * FROM categorias' );

    res.render( 'admin/categorias', {
        categorias
    } );
} );

app.post( '/admin/categorias', async( req, res, next ) => {
    const db = await dbConnection;

    const { categoria } = req.body;
    
    await db.run( `INSERT INTO categorias( categoria ) VALUES( '${categoria}' );` );

    res.redirect( '/admin/categorias' );
} );

app.get( '/admin/categorias/nova', ( req, res, next ) => {
    res.render( 'admin/nova-categoria' );
} );

app.get( '/admin/categorias/editar/:id', async( req, res, next ) => {
    const db = await dbConnection;

    const categoria = await db.get( 'SELECT * FROM categorias WHERE id = ' + req.params.id );
    res.render( 'admin/editar-categoria', {
        categoria
    } );
} );

app.post( '/admin/categorias/editar/:id', async( req, res, next ) => {
    const db = await dbConnection;

    const { categoria } = req.body;
    const { id } = req.params;

    await db.run( `UPDATE categorias SET categoria = '${categoria}' WHERE id = ${id}` );

    res.redirect( '/admin/categorias' );
} );

const init =  async() => {
    const db = await dbConnection;
    await db.run( 'CREATE TABLE IF NOT EXISTS categorias( id INTEGER PRIMARY KEY, categoria TEXT );' );
    await db.run( 'CREATE TABLE IF NOT EXISTS vagas( id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT );' );

    //const categoria = 'Marketing team';
    //await db.run( `INSERT INTO categorias( categoria ) VALUES( '${categoria}' )` );

    //const vaga = 'Marketing Teste Digital ( San Francisco )';
    //const descricao = 'Vaga para fullstack para quem fez o curso Fullstack Lab';
    //await db.run( `INSERT INTO vagas( categoria, titulo, descricao ) VALUES( 2, '${vaga}', '${descricao}' )` );
};

init();

app.listen( 3000, ( err ) => {
    if ( err ) {
        console.log( err );
    }
    else {
        console.log( 'Servidor Jobify rodando...' );
    }
} );