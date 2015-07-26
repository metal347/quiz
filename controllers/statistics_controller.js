var models = require('../models/models.js');

// GET /quizes/statistics
exports.show = function(req, res, next) {
	var statistics = {
		n_preguntas: ' -- ',
		n_comentarios: ' -- ',
		promedio_comentarios: ' -- ',
		preg_sin_com: ' -- ',
		preg_con_com: ' -- ',
		comentarios_no_pub: ' -- '
	};

	// http://docs.sequelizejs.com/en/latest/docs/raw-queries/

	// SELECTs anidados para que se ejecuten secuencialmente, para asegurar que en el render final han terminado todos.
	// También algunos SELECTs precisan del resultado de otros.
	// Postgres necesita los SELECT con las tablas y los campos entre "", SQLite no


/* El código siguiente funciona perfectamente en SQLite pero en Postgres el resultado de los SELECTs es undefined (y no estan mal).

	// Número de preguntas
	models.sequelize.query('SELECT COUNT(*) AS n FROM "Quizzes"').then(function(cuenta) {
		statistics.n_preguntas = cuenta[0].n;

		// Número de comentarios totales
		models.sequelize.query('SELECT COUNT(*) AS n FROM "Comments"').then(function(cuenta) {
			statistics.n_comentarios = cuenta[0].n;

			// si es 0 el número de preguntas no está definido (division by zero is undefined)
			if (+statistics.n_preguntas > 0) {
				// Número medio de comentarios por pregunta
				statistics.promedio_comentarios = statistics.n_comentarios / statistics.n_preguntas;
			}

			// Número de preguntas con comentarios
			// models.sequelize.query('SELECT count(*) AS n FROM "Quizzes" WHERE "id" IN (SELECT DISTINCT "QuizId" FROM "Comments")').then(function(cuenta) {
			models.sequelize.query('SELECT COUNT(DISTINCT "QuizId") AS n FROM "Comments"').then(function(cuenta) {
				statistics.preg_con_com = cuenta[0].n;

				// Número de preguntas sin comentarios
				statistics.preg_sin_com = +statistics.n_preguntas - statistics.preg_con_com;

				// Número de comentarios no publicados
				models.sequelize.query('SELECT COUNT(*) AS n FROM "Comments" WHERE NOT "publicado"').then(function(cuenta) {
					statistics.comentarios_no_pub = cuenta[0].n;
					res.render('statistics/show.ejs', {statistics: statistics, errors: []});
				}).catch(function(error){next(error)});
			}).catch(function(error){next(error)});
		}).catch(function(error){next(error)});
  	}).catch(function(error){next(error)});
*/


	// consultas a BD usando el mapeo objecto-relacional (ORM); se evita las diferencias entre BBDD con los SELECTs
	// ORM: técnica de programación para convertir datos entre el sistema de tipos utilizado en un lenguaje de programación orientado a objetos
	// y la utilización de una base de datos relacional.

	// Número de preguntas
	models.Quiz.count().then(function(result) {
		statistics.n_preguntas = result;

		// Número de comentarios totales
		models.Comment.count().then(function(result) {
			statistics.n_comentarios = result;

			// si es 0 el número de preguntas no está definido (division by zero is undefined)
			if (+statistics.n_preguntas > 0) {
				// Número medio de comentarios por pregunta
				statistics.promedio_comentarios = (statistics.n_comentarios / statistics.n_preguntas).toFixed(2);
			}

			// Número de preguntas con comentarios
			models.Quiz.findAndCountAll( {
				include: [{model: models.Comment, required: true}],
				group: ['Quiz.id', 'Comments.id']
			}).then(function(result) {
				statistics.preg_con_com = result.rows.length;

				// Número de preguntas sin comentarios
				statistics.preg_sin_com = +statistics.n_preguntas - statistics.preg_con_com;

				// Número de comentarios no publicados
				models.Comment.count( {
					where: ['NOT "publicado"']
				}).then(function(result) {
					statistics.comentarios_no_pub = result;
					res.render('statistics/show.ejs', {statistics: statistics, errors: []});
				}).catch(function(error){next(error)});
			}).catch(function(error){next(error)});
		}).catch(function(error){next(error)});
  	}).catch(function(error){next(error)});
};