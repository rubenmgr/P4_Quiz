const model = require("./model");
const {log, biglog, colorize, errorlog} = require("./out");



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
}

exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
}
exports.addCmd = rl => {

    rl.question(colorize( ' Introduzca una pregunta: ', 'red'), question=> {
        rl.question(colorize( ' Introduzca la respuesta: ', 'red'), answer => {

            model.add(question,answer);
            log(`[${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}]`)

            rl.prompt();
        });
    });

};
exports.listCmd = rl => {

   model.getAll().forEach((quiz, id) => {

       log(` [${ colorize(id, 'magenta')}]: ${quiz.question}`);

   });

    rl.prompt();
};
exports.editCmd = (rl,id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro de id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

            rl.question(colorize( ' Introduzca una pregunta: ', 'red'), question=> {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

                rl.question(colorize( ' Introduzca la respuesta: ', 'red'), answer => {

                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz por ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`)
                    rl.prompt();
                });
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.testCmd = (rl,id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro de id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            rl.question(`${colorize(  quiz.question, 'red')}${colorize('?  ', 'red')}`, respuesta => {

                const resp = quiz.answer;



                if (respuesta.trim().toLowerCase() === resp.trim().toLowerCase()){
                    log('Su respuesta es:')
                    biglog("Correcta", "green")
                    rl.prompt();

                }else {
                    log('Su respuesta es:')
                    biglog("Incorrecta", "red")
                    rl.prompt();
                }
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};



    exports.playCmd = rl => {

        let score = 0;
        let size = model.count();
        let toBeResolved = new Array(size);


        for (var i =0; i <toBeResolved.length; i++){
            for (var j=0; j<size; j++ ){
                toBeResolved[j]= j;
            }
            const playOne = () => {
                if(toBeResolved.length <= 0){
                    log("No hay mas preguntas");
                    log(`Fin del juego. Aciertos: ${score}`);
                    biglog(`${score}`, "blue");
                    rl.prompt();
                }else{
                    try{
                        let aleatorio = Math.floor(Math.random()*(toBeResolved.length));
                        let id = toBeResolved[aleatorio];
                        let quiz = model.getByIndex(id);

                        rl.question(`${colorize(  quiz.question, 'red')}${colorize('?  ', 'red')}`, respuesta => {
                            const resp = quiz.answer;
                            if (respuesta.trim().toLowerCase() === resp.trim().toLowerCase()){
                                score++;
                                toBeResolved.splice(aleatorio, 1);
                                log(`Correcto - Lleva ${score} aciertos`)
                                playOne();
                            }else {
                                log('INCORRECTO')
                                log(`Fin del juego. Aciertos: ${score}`);
                                biglog(`${score}`, "blue");
                                rl.prompt();
                            }
                        });
                    }catch(error){
                        errorlog(error.message);
                        rl.prompt();
                    }



                }
            }
            playOne();
        }

    };



    exports.deleteCmd = (rl, id) => {

        if (typeof id === "undefined") {
            errorlog(`Falta el parámetro de id.`);
        } else {
            try {
                model.deleteByIndex(id);
            } catch (error) {
                errorlog(error.message);
            }
        }

        rl.prompt();
    }
    exports.showCmd = (rl, id) => {
        if (typeof id === "undefined") {
            errorlog(`Falta el parámetro de id.`);
            rl.prompt();
        } else {
            try {
                const quiz = model.getByIndex(id);
                log(`[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
            } catch (error) {
                errorlog(error.message);
            }
        }


        rl.prompt();
    }
    exports.creditsCmd = rl => {
        log("Autor de la práctica");
        log("rubenmgr", 'green');
        rl.prompt();
    }
