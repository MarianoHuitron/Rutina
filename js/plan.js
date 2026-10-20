/* Contenido del plan de entrenamiento de Mariano (fuente: Rutina_de_Entrenamiento_Personalizada). */
window.PLAN = (function () {
  const EX = {
    press: { name: 'Press de Pecho Sentado', anim: 'press', station: 'Press de pecho', muscles: 'Pecho, hombro anterior y tríceps',
      cues: ['Espalda pegada al respaldo, asas a la altura del pecho.', 'Empuja hasta casi extender los codos, sin bloquearlos.', 'Regresa en 2–3 s sin dejar caer el peso.'] },
    fly: { name: 'Peck Deck / Aperturas', anim: 'fly', station: 'Pec fly (mariposa)', muscles: 'Pecho (pectoral mayor)',
      cues: ['Codos a 90° con los antebrazos sobre las almohadillas.', 'Junta los brazos frente al pecho y aprieta 1 s.', 'Abre hasta sentir estiramiento sin pasar la línea de los hombros.'] },
    pulldown: { name: 'Jalón al Pecho (Polea Alta)', anim: 'pulldown', station: 'Polea alta + barra larga', muscles: 'Dorsal ancho y bíceps',
      cues: ['Agarre un poco más ancho que los hombros, pecho arriba.', 'Baja la barra a la clavícula llevando los codos abajo y atrás.', 'Sube controlado hasta extender los brazos sin encogerte.'] },
    rowDD: { name: 'Remo Sentado (Polea Baja - Agarre Doble D)', anim: 'row', station: 'Polea baja + agarre doble D', muscles: 'Dorsal ancho (zona media y baja)',
      cues: ['Espalda recta, pecho abierto, rodillas ligeramente flexionadas.', 'Codos pegados al torso; lleva las manos hacia el abdomen.', 'Aprieta los omóplatos 1 s y vuelve estirando sin redondear la espalda.'] },
    triceps: { name: 'Extensiones de Tríceps en Polea', anim: 'pushdown', station: 'Polea alta + cuerda o barra', muscles: 'Tríceps',
      cues: ['Codos pegados a las costillas, sin moverlos.', 'Extiende hasta bloquear suavemente abajo.', 'Sube hasta que el antebrazo quede a ~90°.'] },
    curl: { name: 'Curl de Bíceps en Polea Baja', anim: 'curl', station: 'Polea baja + barra', muscles: 'Bíceps',
      cues: ['Codos fijos al costado del cuerpo.', 'Sube sin balancear el torso.', 'Baja lento (3 s) hasta extender casi por completo.'] },

    legext: { name: 'Extensiones de Cuádriceps', anim: 'legext', station: 'Leg developer (extensión)', muscles: 'Cuádriceps',
      cues: ['Espalda apoyada y rodillas alineadas con el eje de la palanca.', 'Extiende hasta casi bloquear y aprieta el cuádriceps.', 'Baja controlado, sin dejar caer el peso.'] },
    legcurl: { name: 'Curl de Pierna De Pie / Sentado', anim: 'legcurl', station: 'Leg developer (curl) o polea baja', muscles: 'Isquiotibiales',
      cues: ['Cadera pegada al asiento (o torso estable si estás de pie).', 'Lleva el talón hacia el glúteo sin despegar la cadera.', 'Regresa lento: la bajada es la mitad del trabajo.'] },
    legpress: { name: 'Prensa de Pierna o Sentadilla Asistida con Polea', anim: 'legpress', station: 'Prensa (si tu configuración lo permite) o polea', muscles: 'Cuádriceps, glúteo e isquiotibiales',
      cues: ['Pies a la anchura de los hombros, rodillas hacia donde apuntan los pies.', 'Baja hasta ~90° de rodilla con la espalda firme.', 'Empuja con todo el pie sin bloquear las rodillas.'] },
    glute: { name: 'Extensión de Cadera en Polea Baja (Glúteo/Isquios)', anim: 'glute', station: 'Polea baja + tobillera', muscles: 'Glúteo e isquiotibiales',
      cues: ['Sujétate del soporte con el torso ligeramente inclinado y el core firme.', 'Lleva la pierna atrás con la rodilla casi extendida y aprieta el glúteo.', 'No arquees la zona lumbar; regresa lento.'] },
    legraise: { name: 'Elevaciones de Piernas (en silla romana o colgado)', anim: 'roman', station: 'Silla romana / barra', muscles: 'Abdomen inferior y flexores de cadera',
      cues: ['Espalda pegada al respaldo y antebrazos en los apoyos.', 'Sube rodillas o piernas hasta la cadera inclinando la pelvis hacia arriba.', 'Baja lento sin balancearte.'] },
    cablecrunch: { name: 'Crunch en Polea Alta con Cuerda/Barra', anim: 'cablecrunch', station: 'Polea alta + cuerda', muscles: 'Recto abdominal',
      cues: ['De rodillas, cuerda junto a la frente y cadera quieta.', 'Enrolla la columna llevando los codos hacia las rodillas (no es bisagra de cadera).', 'Exhala al bajar y controla la subida.'] },
    plank: { name: 'Plancha Frontal (Isométrica)', anim: 'plank', station: 'Piso / colchoneta', muscles: 'Core completo (isométrico)',
      cues: ['Codos bajo los hombros y cuerpo en línea recta.', 'Glúteos y abdomen contraídos, sin dejar caer la cadera.', 'Respira de forma constante todo el tiempo.'] },

    pulldownSup: { name: 'Jalón al Pecho Agarre Invertido/Supino', anim: 'pulldownSup', station: 'Polea alta + barra (palmas hacia ti)', muscles: 'Dorsal inferior y bíceps',
      cues: ['Agarre supino (palmas hacia ti) a la anchura de los hombros.', 'Lleva la barra al pecho alto con los codos pegados al cuerpo.', 'Controla la subida hasta casi extender los brazos.'] },
    rowProne: { name: 'Remo Sentado (Polea Baja - Barra Corta Prona)', anim: 'rowProne', station: 'Polea baja + barra corta', muscles: 'Trapecio, romboides y deltoides posterior',
      cues: ['Agarre prono (palmas abajo) un poco más abierto que los hombros.', 'Tira llevando los codos atrás y ligeramente hacia afuera.', 'Aprieta la parte alta de la espalda 1 s y regresa controlado.'] },
    latraise: { name: 'Elevaciones Laterales en Polea Baja', anim: 'latraise', station: 'Polea baja (cable cruzado)', muscles: 'Deltoides lateral',
      cues: ['Cable cruzado por delante del cuerpo, codo con ligera flexión.', 'Sube el brazo hasta la altura del hombro, sin impulso.', 'Baja lento; haz una serie por brazo.'] },
    reardelt: { name: 'Deltoides Posterior en Polea / Peck Deck Invertido', anim: 'reardelt', station: 'Pec fly invertido o poleas', muscles: 'Deltoides posterior',
      cues: ['Pecho apoyado en el respaldo, brazos al frente con codos ligeramente flexionados.', 'Abre los brazos hacia atrás hasta la línea del tronco.', 'Evita encoger los hombros; regresa lento.'] },
    shrug: { name: 'Encogimientos de Hombros en Polea Baja', anim: 'shrug', station: 'Polea baja + asas', muscles: 'Trapecio superior',
      cues: ['De pie, brazos estirados con las asas a los costados.', 'Sube los hombros hacia las orejas y aprieta 1 s.', 'Baja controlado; no gires los hombros.'] },

    legextPause: { name: 'Extensiones de Cuádriceps (Pausa de 1 seg arriba)', anim: 'legext', station: 'Leg developer (extensión)', muscles: 'Cuádriceps',
      cues: ['Sube hasta la extensión casi completa.', 'Mantén 1 segundo apretando el cuádriceps.', 'Baja en 3 s sin dejar caer el peso.'] },
    legcurlFem: { name: 'Curl Femoral en Polea/Máquina', anim: 'legcurl', station: 'Leg developer (curl) o polea baja', muscles: 'Isquiotibiales',
      cues: ['Mantén la cadera estable y el abdomen firme.', 'Lleva el talón hacia el glúteo y aprieta arriba.', 'Baja lento hasta casi extender la pierna.'] },
    addabd: { name: 'Aductores / Abductores en Polea Baja', anim: 'addabd', station: 'Polea baja + tobillera', muscles: 'Aductores (interna) y abductores / glúteo medio (externa)',
      cues: ['Sujétate de un soporte con el torso erguido.', 'Abducción: lleva la pierna hacia afuera sin inclinar el tronco. Aducción: crúzala por delante.', 'Movimiento lento y controlado; repite por cada pierna.'] },
    calf: { name: 'Elevación de Talones en Polea Baja (Gemelos)', anim: 'calf', station: 'Polea baja + asas', muscles: 'Gemelos y sóleo',
      cues: ['Apoya la parte delantera del pie (idealmente en un escalón).', 'Sube lo más alto posible y pausa 1 s arriba.', 'Baja estirando completamente el talón.'] },
    twist: { name: 'Giros Rusos (con disco o peso ligero)', anim: 'twist', station: 'Piso + disco o peso ligero', muscles: 'Oblicuos y recto abdominal',
      cues: ['Torso inclinado ~45° con la espalda larga, pies elevados o apoyados.', 'Gira el torso (no solo los brazos) llevando el peso a cada lado.', '20 repeticiones en total: 10 por lado.'] },
    legsFloor: { name: 'Elevación de Piernas Sostenida o Tijeras', anim: 'legsFloor', station: 'Piso / colchoneta', muscles: 'Abdomen inferior',
      cues: ['Zona lumbar pegada al piso en todo momento.', 'Sostenida: baja las piernas casi hasta el piso y sube. Tijeras: cruza alternando.', 'Si la espalda se arquea, sube un poco las piernas.'] },
    sideplank: { name: 'Plancha Lateral', anim: 'sideplank', station: 'Piso / colchoneta', muscles: 'Oblicuos y estabilizadores del core',
      cues: ['Codo bajo el hombro y cuerpo en una sola línea.', 'Eleva la cadera y mantenla alta sin rotar el torso.', 'Respira constante; repite del otro lado.'] }
  };

  const f = (ex, sets, reps, rest, extra) => Object.assign({ ex, sets, reps, rest }, extra);

  const days = [
    { id: 'd1', tab: 'Día 1', tabSub: 'Torso', title: 'Día 1 · Torso', sub: 'Pecho, espalda y brazos + cardio',
      blocks: [
        { title: 'Rutina de fuerza', sub: 'Multifuncional Marcy', items: [
          f('press', 4, '10 - 12', 90), f('fly', 3, '12 - 15', 60), f('pulldown', 4, '10 - 12', 90),
          f('rowDD', 4, '10 - 12', 90), f('triceps', 3, '12 - 15', 60), f('curl', 3, '12 - 15', 60) ] },
        { title: 'Cardio estratégico', sub: 'Caminadora', cardio: { anim: 'walkIncline', name: 'Caminata inclinada',
          stats: [['Tiempo', '25 - 30 min'], ['Inclinación', '6% - 10%'], ['Velocidad', '4.5 - 5.5 km/h']],
          note: 'Caminata a ritmo constante, sin trotar. Mantén una frecuencia cardíaca moderada (Zona 2).' } }
      ] },
    { id: 'd2', tab: 'Día 2', tabSub: 'Pierna + abdomen', title: 'Día 2 · Pierna + Abdomen', sub: 'Fuerza de pierna y bloque de abdomen',
      blocks: [
        { title: 'Rutina de fuerza', sub: 'Multifuncional Marcy', items: [
          f('legext', 4, '12 - 15', 90), f('legcurl', 4, '12 - 15', 90), f('legpress', 3, '12', 90), f('glute', 3, '12 - 15', 60) ] },
        { title: 'Bloque de abdomen', sub: 'Cuida la técnica: calidad antes que cantidad', items: [
          f('legraise', 3, '12 - 15', 45), f('cablecrunch', 3, '15 - 20', 45), f('plank', 3, '45 - 60 seg', 45) ] }
      ] },
    { id: 'd3', tab: 'Día 3', tabSub: 'Descanso activo', title: 'Día 3 · Descanso activo', sub: 'Recuperación sin generar fatiga',
      blocks: [
        { title: 'Actividad', sub: 'Al aire libre o en caminadora', cardio: { anim: 'walkFlat', name: 'Caminata suave',
          stats: [['Tiempo', '30 - 45 min'], ['Inclinación', '0% (plana)'], ['Ritmo', 'Suave']],
          note: 'Objetivo: promover el flujo sanguíneo, facilitar la recuperación muscular y mantener el gasto calórico diario sin generar fatiga.' } }
      ] },
    { id: 'd4', tab: 'Día 4', tabSub: 'Torso 2', title: 'Día 4 · Torso', sub: 'Espalda, hombros y postura + cardio',
      blocks: [
        { title: 'Rutina de fuerza', sub: 'Multifuncional Marcy', items: [
          f('pulldownSup', 4, '10 - 12', 90), f('rowProne', 4, '10 - 12', 90), f('latraise', 4, '12 - 15', 60),
          f('reardelt', 3, '12 - 15', 60), f('shrug', 3, '15', 60) ] },
        { title: 'Cardio estratégico', sub: 'Caminadora', cardio: { anim: 'walkIncline', name: 'Caminata inclinada',
          stats: [['Tiempo', '25 - 30 min'], ['Inclinación', '8% - 12%'], ['Velocidad', '4.0 - 5.0 km/h']],
          note: 'Ritmo constante y postura erguida. No te apoyes en los pasamanos.' } }
      ] },
    { id: 'd5', tab: 'Día 5', tabSub: 'Pierna completa', title: 'Día 5 · Pierna completa + Abdomen', sub: 'Pierna con énfasis en control y bloque de abdomen',
      blocks: [
        { title: 'Rutina de fuerza', sub: 'Multifuncional Marcy', items: [
          f('legextPause', 4, '10 - 12', 90), f('legcurlFem', 4, '10 - 12', 90), f('addabd', 3, '15', 60), f('calf', 4, '15 - 20', 45) ] },
        { title: 'Bloque de abdomen', sub: 'Cuida la técnica: calidad antes que cantidad', items: [
          f('twist', 3, '20 (10 por lado)', 45), f('legsFloor', 3, '12 - 15', 45), f('sideplank', 3, '30 - 45 seg por lado', 45) ] }
      ] },
    { id: 'd6', tab: 'Días 6 y 7', tabSub: 'Descanso total', title: 'Días 6 y 7 · Descanso total', sub: 'Supercompensación muscular y recuperación del sistema nervioso',
      blocks: [], rest: true }
  ];

  return { EX, days };
})();
