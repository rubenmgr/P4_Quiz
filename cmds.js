const {models} = require("./model");
const {log, biglog, colorize, errorlog} = require("./out");
const Sequelize = require('sequelize');


/*
 * Ayuda del programa.
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log("	help|h - Muestra esta ayuda.");
    log("	list - Listar los quizes existentes.");
    log("	show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("	add - Añadir un nuevo quiz interactivamente.");
    log("	delete <id> - Borrar el quiz indicado.");
    log("	edit <id> - Editar el quiz indicado.");
    log("	test <id> - Probar el quiz indicado.");
    log("	p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("	credits - Créditos.");
    log("	q|quit - Salir del programa.");
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
};

exports.listCmd = rl => {
    models.quiz.findAll()
        .each(quiz=> {
        log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`)
})
.catch(error=>{
        errorlog(error.message);
})
.then(()=>{
        rl.prompt();
});
};

const validateId = id=>{
    return new Sequelize.Promise((resolve,reject)=>{
        if (typeof id === "undefined"){
        reject(new Error(`Falta el parámetro <id>.`));
    }else{
        id = parseInt(id); //coge solo la parte entera
        if(Number.isNaN(id)){
            reject(new Error(`El valor del parámetro <id> no es un número.`));
        }else{
            resolve(id);
        }
    }
});
};

exports.showCmd = (rl, id) => {
    validateId(id)
        .then(id =>models.quiz.findById(id))
.then(quiz =>{
        if(!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`)
    }
    log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(error =>{
        errorlog(error.message);
})
.then(()=>{
        rl.prompt();
});
};

const makeQuestion= (rl, text)=>{
    return new Sequelize.Promise((resolve, reject)=>{
        rl.question(colorize(text ,'red'), answer=>{
        resolve(answer.trim());
});
});
};

exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(q=> {
        return makeQuestion(rl, 'Introduzca la respuesta: ')
            .then(a=>{
            return{question:q, answer:a}
        });
})
.then(quiz=>{
        return models.quiz.create(quiz);
})
.then((quiz)=>{
        log(`${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} `);
})
.catch(Sequelize.ValidationError, error =>{
        errorlog('El quiz es erroneo: ');
    error.errors.forEach(({message})=>errorlog(message));
})
.catch(error=>{
        errorlog(error.message)
})
.then(()=>{
        rl.prompt();
});
};


exports.editCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz=>{
        if(!quiz){
        throw  new Error(`No existe un quiz asociado al id=${id}.`)
    }

    process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)}, 0);
    return makeQuestion(rl,'Introduzca la pregunta: ')
        .then(q => {
        process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)}, 0);
    return makeQuestion(rl, 'Introduzca la respuesta: ')
        .then( a=>{
        quiz.question = q;
    quiz.answer =a;
    return quiz;
});
});
})
.then(quiz=>{
        return quiz.save();
})
.then(quiz =>{
        log(`Se ha cambiado el quiz: ${colorize(quiz.id , 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error=>{
        errorlog('El quiz es erroneo: ');
    error.errors.forEach(({message})=>errorlog(message));
})
.catch(error=>{
        errorlog(error.message);
})
.then(()=>{
        rl.prompt();
});
};

exports.testCmd = (rl,id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz=>{
            if(!quiz){
                throw  new Error(`No existe un quiz asociado al id=${id}.`)
            }
            return makeQuestion(rl,`${quiz.question} ? `)
                .then(a => {
                    let resp = a.trim().toLowerCase()
                    let resp2 =quiz.answer;
                    if(resp !== resp2.trim().toLowerCase()) {
                        log('Su respuesta es incorrecta.'),
                            biglog("Incorrecta", "red")

                    }else {
                        return log('Su respuesta es correcta.'),
                            biglog("Correcta", "green")

                    }
                });
        })

.catch(error=>{
        errorlog(error.message);
})
.then(()=>{
        rl.prompt();
});


};



exports.playCmd = rl => {
    let score = 0;
    let toBeResolved=new Array();

    models.quiz.findAll()
        .then(quizzes => {
            quizzes.forEach((quiz, id) => {
                toBeResolved[id] = quiz;
        })
            const playOne = ()=> {
                if ( toBeResolved.length <= 0){
                    log("No hay mas preguntas");
                    log(`Fin del juego. Aciertos: ${score}`);
                    biglog(`${score}`, "blue");
                    rl.prompt();
                }else{
                    let aleatorio = Math.floor(Math.random()*toBeResolved.length);
                    let quiz = toBeResolved[aleatorio];
                    toBeResolved.splice(aleatorio,1);
                    makeQuestion(rl, `${quiz.question}? `)
                                .then(a => {
                                    let resp = a.trim().toLowerCase()
                                    let resp2 =quiz.answer;
                                    if ( resp === resp2.trim().toLowerCase()){
                                        score++;
                                        toBeResolved.splice(aleatorio, 1);
                                        log(`Correcto - Lleva ${score} aciertos`)
                                        playOne();
                                    }else{
                                        console.log(`Incorrecto. Fin del juego. Aciertos: ${score}`);
                                        rl.prompt();
                                    }
                                })
                        .catch(error => {
                            errorlog(error.message);
                        })
                        .then(() => {
                            rl.prompt();
                        });
                }
            };
            playOne();
        });
};


exports.deleteCmd = (rl, id) => {
    validateId(id)
        .then(id=> models.quiz.destroy({where:{id}}))
.catch(error => {
        errorlog(error.message);
})
.then(()=>{
        rl.prompt();
});
};

exports.creditsCmd = rl => {
    log("Autor de la práctica");
    log("rubenmgr", 'green');
    rl.prompt();
};
