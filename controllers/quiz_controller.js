var models = require('../models/models.js');

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
    where: {
      id: Number(quizId)
    },
    // incluimos en req.quiz la propiedad Comments con todos los comentarios asociados al quiz
    include: [{
      model: models.Comment
    }]
  }).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else {next(new Error('No existe quizId=' + quizId))}
    }
  ).catch(function(error){next(error)});
};

// GET /quizes
// buscamos preguntas "/quizes?search=texto_a_buscar" o las listamos todas "/quizes"
exports.index = function(req, res) {
  var search = req.query.search || "";

  // reemplazar todos los espacios por %
  search = "%" + search.replace(/ /g, "%") + "%";
    
  // "models.Quiz.findAll().then(" busca todo en la tabla
  // buscamos las preguntas ordenadas alfabéticamente por el campo "pregunta"
  models.Quiz.findAll({where: ["lower(pregunta) like lower(?)", search], order: "lower(pregunta)"}).then(
    function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: []});
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};            // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Otro"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  // guarda en DB los campos pregunta y respuesta de quiz
  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};