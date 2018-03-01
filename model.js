const fs = require ('fs');
const DB_FILENAME = "quizzes.json";

// Modelo de datos
//En esta variable se mantienen todos los quizzes existentes.
//Es un array de objetos, donde cada objeto tiene los atributos question
// y answer para guardar el texto de la pregunta y de la respuesta.

let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    }

];

const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                save();
                return;
            }
            throw err;
        }
        let json = JSON.parse(data);
        if (json) {
            quizzes = json;
        }

    });
};

const save = () => {
    fs.writeFile(DB_FILENAME, JSON.stringify(quizzes), (err) => {
        if (err) throw err;

    });
}



/*
Devuelve el numero total de preguntas existentes
 */

exports.count = () => quizzes.length;

/*
Añade un nuevo Quiz
 */

exports.add = (question, answer) =>{
    quizzes.push({
        question: (question|| "").trim(),
        answer: (answer|| "").trim()
    });
    save();
};

/*
Actualiza el quiz situado en la posicion index
 */

exports.update = (id, question, answer) =>{
    const quiz= quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id es inválido.`);
    }
    quizzes.splice(id, 1, {
        question: (question|| "").trim(),
        answer: (answer|| "").trim()
    });
    save();
};

/*
Devuelve todos los quizzes existentes
 */
exports.getAll = () =>JSON.parse(JSON.stringify(quizzes));

/*
Devuelve un quiz almacenado en la posición dada.
 */

exports.getByIndex = id => {
    const quiz = quizzes[id];
    if(typeof quiz==="undefined"){
        throw new Error(`El valor del parámetro id es inválido.`);
    }
    return JSON.parse(JSON.stringify(quiz));
};

/*
Elimina el quiz situado en la posicion dada.
 */

exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if(typeof quiz==="undefined"){
        throw new Error(`El valor del parámetro id es inválido.`);
    }
    quizzes.splice(id, 1);
    save();
};


load();
