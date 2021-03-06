var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }      
);

// Importar definicion de la tabla Quiz
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

// Relación 1-a-1: belongsTo(…) y hasOne(…)
// Relación 1-a-N: belongsTo(…) y hasMany(…)
// Relación N-a-M: belongsToMany(…) y belongsToMany(…)
// http://docs.sequelizejs.com/en/latest/docs/associations/
// http://docs.sequelizejs.com/en/latest/api/associations/

// Relación 1:N entre tablas Quiz (preguntas) y Comment (comentarios)
// sequelize resuelve las relaciones; hace por ti el definir un campo extra en la tabla Comment con la 'primaryKey' de Quiz; lo llama QuizId

// 1 comentario pertenece a 1 pregunta
Comment.belongsTo(Quiz);

// 1 pregunta tiene muchos comentarios
// Borrado en cascada de comentarios relacionados al borrar pregunta
Quiz.hasMany(Comment, {
  'constraints': true,
  'onUpdate': 'cascade',
  'onDelete': 'cascade',
  'hooks': true
});

exports.Quiz = Quiz;        // exportar tabla Quiz
exports.Comment = Comment;  // exportar tabla Comment
// exports.sequelize = sequelize;  // exportar sequelize para hacer las RAW Queries en estadísticas (statistics_controller.js)

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      Quiz.bulkCreate( 
        [ {pregunta: 'Capital de Italia',   respuesta: 'Roma',    tema: 'Humanidades'},
          {pregunta: 'Capital de Portugal', respuesta: 'Lisboa',  tema: 'Humanidades'}
        ]
      ).then(function(){console.log('Base de datos inicializada')});
    };
  });
});