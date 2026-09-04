(function () {
  "use strict";

  var STORAGE_KEY = "languagediary:passphrase";
  var DATA_KEY = "languagediary:data";
  var ITERATIONS = 300000;

  var LANG_NAMES = { de: "German", fr: "French", lb: "Luxembourgish" };
  var ACTIVITIES = ["Vocabulary Practice", "Watched a Film/Show", "Listened to a Podcast", "Grammar Review", "Conversation Practice", "Reading", "Other"];

  function seedVocab(items) {
    return items.map(function (it, i) {
      return { id: "v" + i, term: it[0], translation: it[1], example: it[2], exampleTranslation: it[3], topic: it[4], notes: it[5] || "", status: "new", streak: 0 };
    });
  }
  function seedGrammar(items) {
    return items.map(function (it, i) { return { id: "g" + i, title: it[0], body: it[1], topic: it[2] }; });
  }
  function seedMedia(items) {
    return items.map(function (it, i) { return { id: "m" + i, title: it[0], type: it[1], level: it[2], note: it[3] }; });
  }

  var DE_VOCAB = seedVocab([
    ["die Herausforderung", "the challenge", "Der Klimawandel ist eine globale Herausforderung.", "Climate change is a global challenge.", "Opinion & Debate"],
    ["das Vorurteil", "the prejudice, the bias", "Man sollte Vorurteile stets hinterfragen.", "One should always question prejudices.", "Opinion & Debate"],
    ["sich auseinandersetzen mit", "to engage with, to grapple with", "Wir müssen uns intensiver mit diesem Thema auseinandersetzen.", "We need to engage more deeply with this topic.", "Formal Register"],
    ["der Zusammenhang", "the connection, the context", "Das ergibt im Zusammenhang mehr Sinn.", "That makes more sense in context.", "Connectors"],
    ["im Grunde genommen", "basically, fundamentally", "Im Grunde genommen sind wir uns einig.", "Basically, we agree.", "Connectors"],
    ["es kommt darauf an", "it depends", "Es kommt darauf an, wie man es betrachtet.", "It depends on how you look at it.", "Opinion & Debate"],
    ["die Wechselwirkung", "the interaction, the interplay", "Es gibt eine Wechselwirkung zwischen beiden Faktoren.", "There's an interplay between both factors.", "Formal Register"],
    ["nicht von der Hand zu weisen", "hard to dismiss, undeniable", "Das Argument ist nicht von der Hand zu weisen.", "The argument is hard to dismiss.", "Idioms"],
    ["den Nagel auf den Kopf treffen", "to hit the nail on the head", "Damit hast du den Nagel auf den Kopf getroffen.", "With that, you hit the nail on the head.", "Idioms"],
    ["etwas unter die Lupe nehmen", "to scrutinize, examine closely", "Die Presse nahm die Aussage unter die Lupe.", "The press scrutinized the statement.", "Idioms"],
    ["die Auswirkung", "the effect, the impact", "Die Auswirkungen sind noch nicht absehbar.", "The effects aren't foreseeable yet.", "Formal Register"],
    ["einerseits … andererseits", "on one hand … on the other hand", "Einerseits stimme ich zu, andererseits habe ich Bedenken.", "On one hand I agree, on the other I have concerns.", "Connectors"],
    ["der Meinung sein, dass …", "to be of the opinion that …", "Ich bin der Meinung, dass wir handeln müssen.", "I am of the opinion that we must act.", "Opinion & Debate"],
    ["geschweige denn", "let alone", "Ich habe keine Zeit zu kochen, geschweige denn zu backen.", "I don't have time to cook, let alone bake.", "Connectors"],
    ["die Voraussetzung", "the prerequisite, the condition", "Das ist die Voraussetzung für den Erfolg.", "That's the prerequisite for success.", "Formal Register"],
    ["sich Gedanken machen über", "to ponder, to worry about", "Sie macht sich Gedanken über die Zukunft.", "She's pondering the future.", "Opinion & Debate"],
    ["das Dilemma", "the dilemma", "Er steckt in einem echten Dilemma.", "He's in a real dilemma.", "Formal Register"],
    ["nach wie vor", "still, as before", "Die Lage bleibt nach wie vor angespannt.", "The situation remains tense, as before.", "Connectors"],
    ["die Tragweite", "the significance, the scope of consequences", "Er verstand die Tragweite seiner Entscheidung nicht.", "He didn't understand the significance of his decision.", "Formal Register"],
    ["sich etwas zunutze machen", "to make use of, to capitalize on", "Sie machte sich die Gelegenheit zunutze.", "She capitalized on the opportunity.", "Idioms"],
    ["die Errungenschaft", "the achievement", "Das ist eine bedeutende Errungenschaft.", "That is a significant achievement.", "Formal Register"],
    ["im Nachhinein", "in hindsight", "Im Nachhinein hätte ich anders gehandelt.", "In hindsight, I would have acted differently.", "Opinion & Debate"],
    ["der Sachverhalt", "the matter, the facts of the case", "Bitte schildern Sie den Sachverhalt genau.", "Please describe the matter precisely.", "Formal Register"],
    ["das Fingerspitzengefühl", "tact, sensitivity (lit. fingertip feeling)", "Diese Situation erfordert Fingerspitzengefühl.", "This situation requires tact.", "Idioms"]
  ]);

  var DE_GRAMMAR = seedGrammar([
    ["Konjunktiv II for hypotheticals & politeness", "Used for unreal conditions and polite requests: „Ich würde sagen…“, „Wäre es möglich…?“. Formed with würde + infinitive for most verbs, or the irregular forms of sein/haben/modals (wäre, hätte, könnte, müsste).", "Mood & Nuance"],
    ["Passive with modal verbs", "Modal + Passiv: „Das muss erledigt werden“ (This must be done). Structure: conjugated modal verb + past participle + werden (infinitive) at the end of the clause.", "Structure"],
    ["Genitive prepositions in formal writing", "trotz, während, wegen, aufgrund + genitive is standard in written/formal German, though wegen + dative is common in speech. „Aufgrund des schlechten Wetters …“", "Register"],
    ["Nominal style (Nominalstil)", "Formal and academic German often turns verbs into nouns: entscheiden → die Entscheidung treffen; beginnen → den Beginn markieren. Recognizing this pattern helps with reading news and reports.", "Register"],
    ["Relative clauses with prepositions", "The preposition moves before the relative pronoun: „das Buch, über das ich sprach“ (the book I spoke about). The case of the pronoun follows the verb that governs it.", "Structure"],
    ["Two-way prepositions in idiomatic use", "an, auf, in etc. don't always follow the literal motion/location rule in fixed expressions: sich auf etwas freuen (Akk.), Angst vor etwas haben (Dat.) — worth memorizing per verb.", "Mood & Nuance"]
  ]);

  var DE_MEDIA = seedMedia([
    ["Das Leben der Anderen", "Film", "C1", "Stasi-era drama, deliberate and clear standard German — a modern classic."],
    ["Good Bye, Lenin!", "Film", "B2", "Warm, accessible comedy-drama; great everyday vocabulary."],
    ["Toni Erdmann", "Film", "C1", "Dense, naturalistic dialogue — closer to how people actually talk."],
    ["Dark", "Show", "C1", "Netflix sci-fi mystery; fast, layered dialogue, worth subtitles at first."],
    ["Babylon Berlin", "Show", "C1", "1920s period drama, rich vocabulary, slower narrative pace helps."],
    ["How to Sell Drugs Online (Fast)", "Show", "B2", "Youth slang and everyday speech, shorter punchy sentences."],
    ["Slow German mit Annik Rubens", "Podcast", "B1-B2", "Exactly what it says — deliberately slow, clear narration."],
    ["Langsam gesprochene Nachrichten (DW)", "Podcast", "B1-B2", "Deutsche Welle's slowly-read news bulletin, updated daily."],
    ["Easy German", "Podcast", "B2", "Street interviews with natural speech; transcripts available."],
    ["Zeit Verbrechen", "Podcast", "C1", "True-crime journalism podcast — full native speed, for confident learners."]
  ]);

  var FR_VOCAB = seedVocab([
    ["le défi", "the challenge", "Le changement climatique est un défi mondial.", "Climate change is a global challenge.", "Opinion & Debate"],
    ["le préjugé", "the prejudice", "Il faut toujours remettre en question ses préjugés.", "One should always question one's prejudices.", "Opinion & Debate"],
    ["s'interroger sur", "to wonder about, to question", "Il convient de s'interroger sur les conséquences.", "It's worth wondering about the consequences.", "Formal Register"],
    ["dans la mesure où", "insofar as, to the extent that", "Dans la mesure où c'est possible, nous accepterons.", "Insofar as it's possible, we will accept.", "Connectors"],
    ["tout compte fait", "all things considered", "Tout compte fait, c'était une bonne décision.", "All things considered, it was a good decision.", "Connectors"],
    ["cela dépend", "it depends", "Cela dépend du point de vue.", "It depends on the point of view.", "Opinion & Debate"],
    ["l'enjeu (m)", "the stake, what's at stake", "L'enjeu est de taille.", "What's at stake is significant.", "Formal Register"],
    ["il n'en demeure pas moins que", "the fact remains that", "Il n'en demeure pas moins que le problème persiste.", "The fact remains that the problem persists.", "Connectors"],
    ["mettre le doigt sur", "to put one's finger on", "Elle a mis le doigt sur le vrai problème.", "She put her finger on the real problem.", "Idioms"],
    ["prendre du recul", "to step back, to gain perspective", "Il faut savoir prendre du recul.", "One must know how to step back.", "Idioms"],
    ["l'incidence (f)", "the impact, the effect", "Cela a une incidence directe sur les résultats.", "This has a direct impact on the results.", "Formal Register"],
    ["d'une part … d'autre part", "on one hand … on the other", "D'une part c'est risqué, d'autre part c'est prometteur.", "On one hand it's risky, on the other promising.", "Connectors"],
    ["être d'avis que", "to be of the opinion that", "Je suis d'avis qu'il faut agir vite.", "I'm of the opinion that we must act fast.", "Opinion & Debate"],
    ["encore moins", "let alone, even less", "Je n'ai pas le temps de cuisiner, encore moins de faire de la pâtisserie.", "I don't have time to cook, let alone bake.", "Connectors"],
    ["la condition préalable", "the prerequisite", "C'est la condition préalable à toute négociation.", "That's the prerequisite for any negotiation.", "Formal Register"],
    ["se pencher sur", "to look closely into, to address", "Le comité va se pencher sur la question.", "The committee will look into the matter.", "Formal Register"],
    ["le dilemme", "the dilemma", "Elle fait face à un vrai dilemme.", "She faces a real dilemma.", "Formal Register"],
    ["toujours est-il que", "be that as it may, the fact remains", "Toujours est-il qu'il faut trouver une solution.", "Be that as it may, a solution must be found.", "Connectors"],
    ["la portée", "the scope, the significance", "Il n'a pas mesuré la portée de ses propos.", "He didn't gauge the significance of his words.", "Formal Register"],
    ["tirer parti de", "to take advantage of, to make the most of", "Il faut tirer parti de cette opportunité.", "One must take advantage of this opportunity.", "Idioms"],
    ["la réussite", "the achievement, the success", "C'est une belle réussite collective.", "It's a fine collective achievement.", "Formal Register"],
    ["avec le recul", "in hindsight", "Avec le recul, j'aurais fait autrement.", "In hindsight, I would have done otherwise.", "Opinion & Debate"],
    ["la problématique", "the issue at hand (academic framing)", "La problématique mérite d'être approfondie.", "The issue deserves to be explored further.", "Formal Register"],
    ["le doigté", "tact, finesse", "Cette affaire exige beaucoup de doigté.", "This matter requires a great deal of tact.", "Idioms"]
  ]);

  var FR_GRAMMAR = seedGrammar([
    ["Subjunctive after doubt & opinion", "Triggered by expressions like bien que, il est possible que, je doute que: „Bien qu'il soit tard, nous continuons.“ The subjunctive signals subjectivity, not fact.", "Mood & Nuance"],
    ["Conditional for hypotheticals & politeness", "Si + imparfait, conditionnel présent: „Si j'avais le temps, je viendrais.“ Also softens requests: „Pourriez-vous m'aider?“", "Mood & Nuance"],
    ["'ne … que' vs 'ne … pas'", "'ne … que' means only, not a true negation: „Je n'ai que deux euros“ = I only have two euros, not I don't have two euros.", "Register"],
    ["Gerund with 'en' for simultaneity", "'en' + present participle expresses doing two things at once, or cause/manner: „Il a répondu en souriant“ (He answered while smiling).", "Structure"],
    ["Passive alternatives: 'se faire' and impersonal 'on'", "French often avoids the literal passive voice: „Le vin se boit frais“ (Wine is drunk chilled) or „On m'a dit que…“ (I was told that…).", "Structure"],
    ["Relative pronouns 'dont' and 'lequel'", "'dont' replaces de + noun: „le livre dont je parle“. 'lequel/laquelle' follows other prepositions: „la raison pour laquelle je suis venu“.", "Structure"]
  ]);

  var FR_MEDIA = seedMedia([
    ["Intouchables", "Film", "B2", "Warm, funny, and widely loved — clear enunciation throughout."],
    ["La Haine", "Film", "C1", "Street French, argot-heavy — challenging but iconic."],
    ["Amélie", "Film", "B2", "Whimsical narration, clearly spoken — a gentle classic."],
    ["Dix Pour Cent (Call My Agent!)", "Show", "C1", "Witty, fast industry dialogue about a Parisian talent agency."],
    ["Lupin", "Show", "B2-C1", "Netflix thriller, clean modern French, broad appeal."],
    ["Plan Cœur (The Hook Up Plan)", "Show", "B2", "Contemporary youth French, everyday conversational register."],
    ["InnerFrench", "Podcast", "B2-C1", "Made for learners but at a near-natural pace, thoughtful topics."],
    ["Journal en français facile (RFI)", "Podcast", "B1-B2", "Daily news read in simplified, clear French."],
    ["News in Slow French", "Podcast", "B1-B2", "Deliberately paced current-affairs discussion."],
    ["Coffee Break French", "Podcast", "A2-B2", "Structured lessons — useful for reinforcing grammar systematically."]
  ]);

  var LB_VOCAB = seedVocab([
    ["d'Erausfuerderung", "the challenge", "De Klimawandel ass eng global Erausfuerderung.", "Climate change is a global challenge.", "Formal & Debate"],
    ["de Virdeel", "the advantage", "Dat huet vill Virdeeler.", "That has many advantages.", "Formal & Debate"],
    ["den Nodeel", "the disadvantage", "Et gëtt och e puer Nodeeler.", "There are also a few disadvantages.", "Formal & Debate"],
    ["et hänkt dovunner of", "it depends", "Et hänkt dovunner of, wéi een et gesäit.", "It depends on how you see it.", "Everyday Formal"],
    ["op der enger Säit … op der anerer Säit", "on one hand … on the other hand", "Op der enger Säit ass et riskant, op der anerer Säit villverspriechend.", "On one hand it's risky, on the other promising.", "Connectors"],
    ["ech mengen, datt …", "I think that …", "Ech mengen, datt mer eppes maache mussen.", "I think that we need to do something.", "Everyday Formal"],
    ["d'Viraussetzung", "the prerequisite", "Dat ass d'Viraussetzung fir den Erfolleg.", "That's the prerequisite for success.", "Formal & Debate"],
    ["d'Erfahrung", "the experience", "Si huet vill Erfahrung an deem Beräich.", "She has a lot of experience in that field.", "Everyday Formal"],
    ["am Fong", "basically, at heart", "Am Fong sinn ech domat averstanen.", "Basically, I agree with that.", "Connectors"],
    ["an der Tat", "indeed", "An der Tat war dat eng gutt Entscheedung.", "Indeed, that was a good decision.", "Connectors"],
    ["duerfir", "therefore", "Duerfir hu mer eis anescht entscheed.", "Therefore, we decided differently.", "Connectors"],
    ["obwuel", "although", "Obwuel et spéit war, sinn ech nach komm.", "Although it was late, I still came.", "Connectors"],
    ["wann ech mech net iere", "if I'm not mistaken", "Wann ech mech net iere, huet en dat scho gesot.", "If I'm not mistaken, he already said that.", "Everyday Formal"],
    ["d'Meenung sinn, datt …", "to be of the opinion that …", "Ech sinn der Meenung, datt mer méi Zäit brauchen.", "I'm of the opinion that we need more time.", "Formal & Debate"]
  ]);

  var LB_GRAMMAR = seedGrammar([
    ["Verb-second word order", "Like German and Dutch, the conjugated verb is the second element in a main clause: „Haut ginn ech schaffen“ (Today I go to work) — 'ginn' stays second even though 'Haut' opens the sentence.", "Structure"],
    ["Articles: de, d', dat", "Luxembourgish uses de (masculine), d' (feminine and plural, often elided before vowels), and dat (neuter) — a simpler system than German's der/die/das, without case endings.", "Structure"],
    ["No case system like standard German", "Luxembourgish has largely dropped the dative/accusative distinction German keeps — word order and prepositions carry more of that work instead.", "Structure"],
    ["hunn vs. sinn as the perfect-tense auxiliary", "A similar split to German haben/sein: motion and change-of-state verbs typically take sinn (Ech sinn gaang), most others take hunn (Ech hu geschafft).", "Structure"]
  ]);

  var LB_MEDIA = seedMedia([
    ["Eng nei Zäit", "Film", "C1", "Luxembourg's 2018 Oscar submission — post-WWII drama, spoken Luxembourgish."],
    ["Superjhemp retourne", "Film", "B2-C1", "Comic-book comedy in Luxembourgish — lighter, more colloquial speech."],
    ["100,7", "Podcast", "All levels", "Luxembourgish public radio — live and on-demand, the most reliable everyday-listening source."],
    ["RTL Lëtzebuerg (radio & TV)", "Show", "All levels", "News and talk in Luxembourgish; good for ear-training on real broadcast speech."]
  ]);

  var DEFAULT_STATE = {
    currentLang: "de",
    languages: {
      de: { vocab: DE_VOCAB, grammar: DE_GRAMMAR, media: DE_MEDIA, log: [] },
      fr: { vocab: FR_VOCAB, grammar: FR_GRAMMAR, media: FR_MEDIA, log: [] },
      lb: { vocab: LB_VOCAB, grammar: LB_GRAMMAR, media: LB_MEDIA, log: [] }
    },
    streak: { lastDate: null, count: 0 }
  };

  var envelope = null;
  var state = null;
  var cryptoKey = null;
  var locked = true;
  var busy = false;
  var lockError = "";
  var savedFlash = false;
  var mode = "practice"; // practice | browse | grammar | media | log
  var practiceQueue = [];
  var practiceIndex = 0;
  var revealed = false;
  var includeKnown = false;
  var browseTopic = null;
  var mediaTypeFilter = null;
  var currentPracticeType = null;
  var choicePicked = null;
  var sessionStartTime = null;
  var sessionLogged = false;

  // ---------- crypto helpers ----------
  function b64encode(buf) { var bytes = new Uint8Array(buf); var bin = ""; for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin); }
  function b64decode(str) { var bin = atob(str); var bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return bytes.buffer; }
  function randomBytes(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
  function deriveKey(passphrase, saltBytes) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]).then(function (baseKey) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: saltBytes, iterations: ITERATIONS, hash: "SHA-256" }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }
  function encryptJSON(obj, key) {
    var iv = randomBytes(12); var enc = new TextEncoder(); var data = enc.encode(JSON.stringify(obj));
    return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data).then(function (ctBuf) { return { iv: b64encode(iv), ct: b64encode(ctBuf) }; });
  }
  function decryptJSON(ivB64, ctB64, key) {
    var iv = new Uint8Array(b64decode(ivB64)); var ctBuf = b64decode(ctB64);
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ctBuf).then(function (plainBuf) { return JSON.parse(new TextDecoder().decode(plainBuf)); });
  }

  function pad(n) { return String(n).padStart(2, "0"); }
  function isoFromDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayISO() { return isoFromDate(new Date()); }
  function dayLabel(iso) { var d = new Date(iso + "T00:00:00"); return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }); }
  function uid(prefix) { return (prefix || "v") + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function daysBetween(a, b) { return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000); }
  function round(n) { return Math.round(n); }

  function markPracticeDay() {
    var today = todayISO();
    var s = state.streak;
    if (s.lastDate === today) return;
    if (s.lastDate) { var diff = daysBetween(s.lastDate, today); s.count = diff === 1 ? s.count + 1 : 1; } else { s.count = 1; }
    s.lastDate = today;
  }

  function ensureShape(s) {
    Object.keys(LANG_NAMES).forEach(function (code) {
      if (!s.languages[code]) s.languages[code] = { vocab: [], grammar: [], media: [], log: [] };
      if (!s.languages[code].media) s.languages[code].media = [];
      if (!s.languages[code].log) s.languages[code].log = [];
    });
    if (!s.streak) s.streak = { lastDate: null, count: 0 };
  }

  // ---------- storage ----------
  function getEnvelopeFromStorage() {
    try { var raw = localStorage.getItem(DATA_KEY); if (raw) { var e = JSON.parse(raw); if (e && typeof e === "object") return e; } } catch (err) {}
    return { v: 1, salt: null, iv: null, ct: null };
  }
  function saveEnvelopeToStorage(env) { localStorage.setItem(DATA_KEY, JSON.stringify(env)); }

  // ---------- lock / setup / unlock ----------
  function renderSetupScreen() {
    return '<div class="lock-wrap"><div class="lock-card"><span class="eyebrow">Private &amp; Encrypted</span><h1>Set Your Passphrase</h1>' +
      '<p class="desc">It encrypts everything right here in this browser before anything is ever saved — nothing leaves your device. There\'s no reset that keeps your data, so choose something memorable.</p>' +
      (lockError ? '<div class="lock-error">' + escapeHTML(lockError) + "</div>" : "") +
      '<form data-form="setup">' +
        '<div class="lock-field"><label for="s-pass">Passphrase (8+ characters)</label><input id="s-pass" name="pass" type="password" autocomplete="new-password" required /></div>' +
        '<div class="lock-field"><label for="s-pass2">Confirm passphrase</label><input id="s-pass2" name="pass2" type="password" autocomplete="new-password" required /></div>' +
        '<label class="lock-row"><input type="checkbox" name="remember" /> Remember on this device</label>' +
        '<button type="submit" class="primary" ' + (busy ? "disabled" : "") + ">" + (busy ? "Setting Up…" : "Enter") + "</button></form>" +
      '<p class="lock-note">A fully standalone diary — your data lives only in this browser\'s storage on this device. It doesn\'t sync anywhere, and nothing is sent over the network.</p></div></div>';
  }
  function renderUnlockScreen() {
    return '<div class="lock-wrap"><div class="lock-card"><span class="eyebrow">Private &amp; Encrypted</span><h1>Welcome Back</h1>' +
      '<p class="desc">Enter your passphrase to unlock your diary.</p>' +
      (lockError ? '<div class="lock-error">' + escapeHTML(lockError) + "</div>" : "") +
      '<form data-form="unlock">' +
        '<div class="lock-field"><label for="u-pass">Passphrase</label><input id="u-pass" name="pass" type="password" autocomplete="current-password" required /></div>' +
        '<label class="lock-row"><input type="checkbox" name="remember" /> Remember on this device</label>' +
        '<button type="submit" class="primary" ' + (busy ? "disabled" : "") + ">" + (busy ? "Unlocking…" : "Unlock") + "</button></form>" +
      '<button type="button" class="lock-reset" data-action="reset">Forgotten your passphrase? Reset and start over</button></div></div>';
  }
  function bindLockEvents() {
    var app = document.getElementById("app");
    var setupForm = app.querySelector('[data-form="setup"]');
    if (setupForm) setupForm.addEventListener("submit", function (e) {
      e.preventDefault(); if (busy) return;
      var fd = new FormData(setupForm);
      var pass = (fd.get("pass") || "").toString(); var pass2 = (fd.get("pass2") || "").toString(); var remember = !!fd.get("remember");
      if (pass.length < 8) { lockError = "Passphrase needs to be at least 8 characters."; render(); return; }
      if (pass !== pass2) { lockError = "Those two passphrases don't match."; render(); return; }
      lockError = ""; busy = true; render(); handleSetup(pass, remember);
    });
    var unlockForm = app.querySelector('[data-form="unlock"]');
    if (unlockForm) unlockForm.addEventListener("submit", function (e) {
      e.preventDefault(); if (busy) return;
      var fd = new FormData(unlockForm);
      var pass = (fd.get("pass") || "").toString(); var remember = !!fd.get("remember");
      lockError = ""; busy = true; render(); handleUnlock(pass, remember);
    });
    var resetBtn = app.querySelector('[data-action="reset"]');
    if (resetBtn) resetBtn.addEventListener("click", function () {
      if (!window.confirm("This permanently deletes your saved Language Diary data on this device and can't be undone. Continue?")) return;
      handleReset();
    });
  }
  function handleSetup(pass, remember) {
    var salt = randomBytes(16);
    deriveKey(pass, salt).then(function (key) {
      return encryptJSON(DEFAULT_STATE, key).then(function (enc) {
        envelope = { v: 1, salt: b64encode(salt), iv: enc.iv, ct: enc.ct };
        saveEnvelopeToStorage(envelope);
        cryptoKey = key; state = JSON.parse(JSON.stringify(DEFAULT_STATE)); locked = false; busy = false;
        if (remember) { try { localStorage.setItem(STORAGE_KEY, pass); } catch (e) {} }
        buildQueue();
        render();
      });
    }).catch(function (err) {
      busy = false; locked = true; cryptoKey = null; state = null;
      lockError = "Something went wrong setting that up — try again.";
      console.warn("Language Diary: setup failed", err); render();
    });
  }
  function handleUnlock(pass, remember) {
    var saltBytes = new Uint8Array(b64decode(envelope.salt));
    deriveKey(pass, saltBytes).then(function (key) {
      return decryptJSON(envelope.iv, envelope.ct, key).then(function (plain) {
        cryptoKey = key; state = plain; locked = false; busy = false;
        ensureShape(state);
        if (remember) { try { localStorage.setItem(STORAGE_KEY, pass); } catch (e) {} }
        buildQueue();
        render();
      });
    }).catch(function () { busy = false; lockError = "That passphrase didn't work — try again."; render(); });
  }
  function handleReset() {
    envelope = { v: 1, salt: null, iv: null, ct: null };
    cryptoKey = null; state = null; locked = true; lockError = "";
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(DATA_KEY); } catch (e) {}
    render();
  }
  function lockNow() { cryptoKey = null; state = null; locked = true; lockError = ""; try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} render(); }

  // ---------- practice logic ----------
  function currentLang() { return state.languages[state.currentLang]; }

  function coreTerm(term) {
    var t = term.split(" … ")[0].split("…")[0];
    t = t.replace(/^(der|die|das|den|dem|des|le|la|les|l'|de|d'|dat|een|eng)\s+/i, "");
    return t.trim();
  }
  function buildCloze(card) {
    var core = coreTerm(card.term);
    if (!core || !card.example) return null;
    var idx = card.example.toLowerCase().indexOf(core.toLowerCase());
    if (idx === -1) return null;
    return {
      before: card.example.slice(0, idx),
      blank: card.example.slice(idx, idx + core.length),
      after: card.example.slice(idx + core.length)
    };
  }
  function pickTypeForCard(card) {
    var candidates = ["recall", "recall", "reverse", "choice"];
    if (buildCloze(card)) candidates.push("cloze");
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  function buildChoices(card) {
    var pool = currentLang().vocab.filter(function (v) { return v.id !== card.id && v.translation !== card.translation; });
    var distractors = shuffle(pool).slice(0, 3).map(function (v) { return v.translation; });
    return shuffle(distractors.concat([card.translation]));
  }
  function setCurrentType() {
    var card = currentCard();
    currentPracticeType = card ? pickTypeForCard(card) : null;
    choicePicked = null;
  }
  function buildQueue() {
    var pool = currentLang().vocab.filter(function (v) { return includeKnown || v.status !== "known"; });
    practiceQueue = shuffle(pool).map(function (v) { return v.id; });
    practiceIndex = 0; revealed = false;
    sessionStartTime = Date.now(); sessionLogged = false;
    setCurrentType();
  }
  function currentCard() {
    if (practiceIndex >= practiceQueue.length) return null;
    var id = practiceQueue[practiceIndex];
    return currentLang().vocab.filter(function (v) { return v.id === id; })[0] || null;
  }
  function counts(lang) {
    var v = lang.vocab;
    return {
      known: v.filter(function (x) { return x.status === "known"; }).length,
      learning: v.filter(function (x) { return x.status === "learning"; }).length,
      neu: v.filter(function (x) { return x.status === "new"; }).length,
      total: v.length
    };
  }
  function autoLogSessionIfDone() {
    if (sessionLogged || !practiceQueue.length || practiceIndex < practiceQueue.length) return;
    sessionLogged = true;
    var minutes = Math.max(1, round((Date.now() - sessionStartTime) / 60000));
    currentLang().log.push({ id: uid("l"), date: todayISO(), activity: "Vocabulary Practice", minutes: minutes, note: practiceQueue.length + " card" + (practiceQueue.length === 1 ? "" : "s") + " reviewed" });
  }

  // ---------- log stats ----------
  function last7DaysMinutes(lang) {
    var out = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var iso = isoFromDate(d);
      var label = d.toLocaleDateString(undefined, { weekday: "short" });
      var minutes = lang.log.filter(function (l) { return l.date === iso; }).reduce(function (s, l) { return s + (l.minutes || 0); }, 0);
      out.push({ label: label, minutes: minutes });
    }
    return out;
  }

  // ---------- render pieces ----------
  function renderLangTabs() {
    return '<div class="lang-tabs">' + Object.keys(LANG_NAMES).map(function (code) {
      return '<button type="button" class="lang-tab ' + (state.currentLang === code ? "active" : "") + '" data-action="set-lang" data-lang="' + code + '">' + LANG_NAMES[code] + "</button>";
    }).join("") + "</div>";
  }

  function renderStats() {
    var c = counts(currentLang());
    return (
      '<div class="stats">' +
      '<div class="stat-card"><p class="stat-label">Known</p><p class="stat-value num">' + c.known + "</p></div>" +
      '<div class="stat-card"><p class="stat-label">Learning</p><p class="stat-value num">' + c.learning + "</p></div>" +
      '<div class="stat-card"><p class="stat-label">New</p><p class="stat-value num">' + c.neu + "</p></div>" +
      '<div class="stat-card"><p class="stat-label">Day Streak</p><p class="stat-value num">' + (state.streak.count || 0) + "</p></div>" +
      "</div>"
    );
  }

  function renderModeTabs() {
    var modes = [["practice", "Practice"], ["browse", "Browse"], ["grammar", "Grammar"], ["media", "Watch & Listen"], ["log", "Log"]];
    return '<div class="mode-tabs">' + modes.map(function (m) {
      return '<button type="button" class="mode-tab ' + (mode === m[0] ? "active" : "") + '" data-action="set-mode" data-mode="' + m[0] + '">' + m[1] + "</button>";
    }).join("") + "</div>";
  }

  function renderPractice() {
    var card = currentCard();
    if (!card) {
      autoLogSessionIfDone();
      return (
        '<div class="panel"><div class="practice-card">' +
        '<p class="eyebrow">Session Complete</p>' +
        '<h2 style="margin-top:10px;">You’ve been through everything due for review.</h2>' +
        '<p class="field-hint" style="color:var(--muted); margin-top:10px;">Logged to your practice history. Come back tomorrow, or review words you already know for extra practice.</p>' +
        '<div class="practice-actions">' +
          '<button type="button" class="ghost" data-action="practice-known">' + (includeKnown ? "Hide Known Words" : "Practice Known Words Too") + "</button>" +
          '<button type="button" class="primary" data-action="restart-queue">Restart Queue</button>' +
        "</div></div></div>"
      );
    }

    var promptHTML = "";
    var answerHTML = "";
    var badge = '<span class="status-badge ' + card.status + '">' + card.status + "</span>";

    if (currentPracticeType === "reverse") {
      promptHTML = '<p class="practice-topic eyebrow">' + escapeHTML(card.topic) + " · Translate into " + LANG_NAMES[state.currentLang] + '</p><p class="practice-term">' + escapeHTML(card.translation) + "</p>";
      answerHTML = revealed ? '<p class="practice-translation">' + escapeHTML(card.term) + "</p><p class=\"practice-example\">" + escapeHTML(card.example) + '</p><p class="practice-example-tr">' + escapeHTML(card.exampleTranslation) + "</p>" : "";
    } else if (currentPracticeType === "cloze") {
      var cz = buildCloze(card);
      promptHTML = '<p class="practice-topic eyebrow">' + escapeHTML(card.topic) + ' · Fill in the blank</p><p class="cloze-text">' + escapeHTML(cz.before) + '<span class="cloze-blank">_____</span>' + escapeHTML(cz.after) + "</p>";
      answerHTML = revealed ? '<p class="practice-translation">' + escapeHTML(card.term) + "</p><p class=\"practice-example-tr\">" + escapeHTML(card.exampleTranslation) + "</p>" : "";
    } else if (currentPracticeType === "choice") {
      var options = buildChoices(card);
      promptHTML = '<p class="practice-topic eyebrow">' + escapeHTML(card.topic) + " · Choose the translation</p><p class=\"practice-term\">" + escapeHTML(card.term) + "</p>";
      if (!revealed) {
        promptHTML += '<div class="choice-grid">' + options.map(function (opt) {
          return '<button type="button" class="choice-option" data-action="choose-option" data-value="' + escapeHTML(opt) + '">' + escapeHTML(opt) + "</button>";
        }).join("") + "</div>";
      } else {
        promptHTML += '<div class="choice-grid">' + options.map(function (opt) {
          var cls = opt === card.translation ? "correct" : (opt === choicePicked ? "incorrect" : "");
          return '<button type="button" class="choice-option ' + cls + '" disabled>' + escapeHTML(opt) + "</button>";
        }).join("") + "</div>";
        answerHTML = '<p class="practice-example" style="margin-top:20px;">' + escapeHTML(card.example) + "</p><p class=\"practice-example-tr\">" + escapeHTML(card.exampleTranslation) + "</p>";
      }
    } else {
      promptHTML = '<p class="practice-topic eyebrow">' + escapeHTML(card.topic) + '</p><p class="practice-term">' + escapeHTML(card.term) + "</p>";
      answerHTML = revealed ? '<p class="practice-translation">' + escapeHTML(card.translation) + "</p><p class=\"practice-example\">" + escapeHTML(card.example) + '</p><p class="practice-example-tr">' + escapeHTML(card.exampleTranslation) + "</p>" : "";
    }

    var showAnswerBtn = (currentPracticeType !== "choice" && !revealed)
      ? '<div class="practice-actions"><button type="button" class="primary" data-action="reveal">Show Answer</button></div>' : "";
    var gradeButtons = revealed
      ? '<div class="practice-actions"><button type="button" class="negative-btn" data-action="mark-learning">Still Learning</button><button type="button" class="positive-btn" data-action="mark-known">Got It</button></div>'
      : "";

    return (
      '<div class="panel"><div class="practice-card">' +
      promptHTML + answerHTML + showAnswerBtn + gradeButtons +
      '<p class="practice-meta">' + (practiceIndex + 1) + " of " + practiceQueue.length + " · " + badge + "</p>" +
      "</div></div>"
    );
  }

  function renderBrowse() {
    var vocab = currentLang().vocab;
    var topics = [];
    var seen = {};
    vocab.forEach(function (v) { if (!seen[v.topic]) { seen[v.topic] = true; topics.push(v.topic); } });
    var list = browseTopic ? vocab.filter(function (v) { return v.topic === browseTopic; }) : vocab;

    var filters = '<div class="filters"><button type="button" class="chip ' + (!browseTopic ? "active" : "") + '" data-action="filter-topic" data-topic="">All</button>' +
      topics.map(function (t) { return '<button type="button" class="chip ' + (browseTopic === t ? "active" : "") + '" data-action="filter-topic" data-topic="' + escapeHTML(t) + '">' + escapeHTML(t) + "</button>"; }).join("") + "</div>";

    var rows = list.length ? list.map(function (v) {
      return (
        '<div class="vocab-row">' +
        '<div><div class="vocab-term">' + escapeHTML(v.term) + '</div><div class="vocab-translation">' + escapeHTML(v.translation) + "</div></div>" +
        '<span class="vocab-topic">' + escapeHTML(v.topic) + "</span>" +
        '<div><span class="status-badge ' + v.status + '">' + v.status + '</span> <button type="button" class="vocab-del" data-action="del-vocab" data-id="' + v.id + '" aria-label="Delete">✕</button></div>' +
        "</div>"
      );
    }).join("") : '<p class="empty">No entries here yet.</p>';

    return (
      '<div class="panel"><h2>' + LANG_NAMES[state.currentLang] + " Vocabulary</h2>" + filters + rows +
      '<form data-form="add-vocab">' +
        '<div class="field-row">' +
          '<div class="field"><label for="v-term">Term</label><input id="v-term" name="term" type="text" required /></div>' +
          '<div class="field"><label for="v-translation">Translation</label><input id="v-translation" name="translation" type="text" required /></div>' +
        "</div>" +
        '<div class="field-row">' +
          '<div class="field"><label for="v-example">Example sentence</label><input id="v-example" name="example" type="text" /></div>' +
          '<div class="field"><label for="v-example-tr">Example translation</label><input id="v-example-tr" name="exampleTranslation" type="text" /></div>' +
        "</div>" +
        '<div class="field"><label for="v-topic">Topic</label><input id="v-topic" name="topic" type="text" placeholder="e.g. Idioms" required /></div>' +
        '<button type="submit" class="primary small">Add Word</button>' +
      "</form></div>"
    );
  }

  function renderGrammar() {
    var grammar = currentLang().grammar;
    var cards = grammar.length ? grammar.map(function (g) {
      return (
        '<div class="grammar-card">' +
        '<button type="button" class="grammar-del" data-action="del-grammar" data-id="' + g.id + '" aria-label="Delete">✕</button>' +
        '<span class="grammar-topic">' + escapeHTML(g.topic) + "</span>" +
        '<h3 class="grammar-title">' + escapeHTML(g.title) + "</h3>" +
        '<p class="grammar-body">' + escapeHTML(g.body) + "</p>" +
        "</div>"
      );
    }).join("") : '<p class="empty">No grammar notes yet.</p>';

    return (
      '<div class="panel"><h2>' + LANG_NAMES[state.currentLang] + " Grammar Notes</h2>" + cards +
      '<form data-form="add-grammar">' +
        '<div class="field"><label for="gr-title">Title</label><input id="gr-title" name="title" type="text" required /></div>' +
        '<div class="field"><label for="gr-topic">Topic</label><input id="gr-topic" name="topic" type="text" placeholder="e.g. Structure" required /></div>' +
        '<div class="field"><label for="gr-body">Note</label><textarea id="gr-body" name="body" required></textarea></div>' +
        '<button type="submit" class="primary small">Add Note</button>' +
      "</form></div>"
    );
  }

  function renderMedia() {
    var media = currentLang().media;
    var types = ["Film", "Show", "Podcast"];
    var list = mediaTypeFilter ? media.filter(function (m) { return m.type === mediaTypeFilter; }) : media;

    var filters = '<div class="filters"><button type="button" class="chip ' + (!mediaTypeFilter ? "active" : "") + '" data-action="filter-media-type" data-type="">All</button>' +
      types.map(function (t) { return '<button type="button" class="chip ' + (mediaTypeFilter === t ? "active" : "") + '" data-action="filter-media-type" data-type="' + t + '">' + t + "s</button>"; }).join("") + "</div>";

    var rows = list.length ? list.map(function (m) {
      return (
        '<div class="media-row">' +
        '<div><div class="media-title">' + escapeHTML(m.title) + '</div><div class="media-badges"><span class="media-badge">' + escapeHTML(m.type) + '</span><span class="media-badge">' + escapeHTML(m.level) + '</span></div><div class="media-note">' + escapeHTML(m.note) + "</div></div>" +
        '<button type="button" class="media-del" data-action="del-media" data-id="' + m.id + '" aria-label="Delete">✕</button>' +
        "</div>"
      );
    }).join("") : '<p class="empty">No recommendations here yet.</p>';

    var note = state.currentLang === "lb"
      ? "Luxembourgish media is limited given the size of the language — Luxembourgers are typically trilingual, so leaning on the German and French lists is a common, legitimate strategy too."
      : "A starting list — availability varies by platform and region.";

    return (
      '<div class="panel"><h2>' + LANG_NAMES[state.currentLang] + " — Watch &amp; Listen</h2>" +
      '<p class="field-hint" style="margin-bottom:16px;">' + note + "</p>" +
      filters + rows +
      '<form data-form="add-media">' +
        '<div class="field-row">' +
          '<div class="field"><label for="med-title">Title</label><input id="med-title" name="title" type="text" required /></div>' +
          '<div class="field"><label for="med-type">Type</label><select id="med-type" name="type"><option>Film</option><option>Show</option><option>Podcast</option></select></div>' +
        "</div>" +
        '<div class="field-row">' +
          '<div class="field"><label for="med-level">Level</label><input id="med-level" name="level" type="text" placeholder="e.g. B2" /></div>' +
          '<div class="field"><label for="med-note">Note</label><input id="med-note" name="note" type="text" placeholder="Why it is worth your time" /></div>' +
        "</div>" +
        '<button type="submit" class="primary small">Add Recommendation</button>' +
      "</form></div>"
    );
  }

  function renderLog() {
    var lang = currentLang();
    var week = last7DaysMinutes(lang);
    var max = Math.max.apply(null, week.map(function (d) { return d.minutes; }).concat([1]));
    var bars = week.map(function (d) {
      var h = Math.max(2, round((d.minutes / max) * 100));
      return '<div class="chart-col"><div class="chart-bar" style="height:' + h + '%" title="' + d.minutes + ' min"></div><span class="chart-label">' + d.label + "</span></div>";
    }).join("");
    var totalWeek = week.reduce(function (s, d) { return s + d.minutes; }, 0);

    var entries = lang.log.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id.localeCompare(a.id); }).slice(0, 40);
    var rows = entries.length ? entries.map(function (l) {
      return (
        '<div class="log-row">' +
        '<span class="log-date">' + dayLabel(l.date) + "</span>" +
        '<div><div class="log-activity">' + escapeHTML(l.activity) + "</div>" + (l.note ? '<div class="log-note-text">' + escapeHTML(l.note) + "</div>" : "") + "</div>" +
        '<span class="log-minutes num">' + l.minutes + " min</span>" +
        '<button type="button" class="vocab-del" data-action="del-log" data-id="' + l.id + '" aria-label="Delete">✕</button>' +
        "</div>"
      );
    }).join("") : '<p class="empty">No sessions logged yet.</p>';

    var opts = ACTIVITIES.map(function (a) { return "<option>" + a + "</option>"; }).join("");

    return (
      '<div class="panel"><h2>' + LANG_NAMES[state.currentLang] + " — Practice Log</h2>" +
      '<p class="field-hint">' + totalWeek + " minute" + (totalWeek === 1 ? "" : "s") + " this week</p>" +
      '<div class="chart">' + bars + "</div>" +
      '<div style="margin-top:26px;">' + rows + "</div>" +
      '<form data-form="add-log">' +
        '<div class="field-row">' +
          '<div class="field"><label for="l-activity">Activity</label><select id="l-activity" name="activity">' + opts + "</select></div>" +
          '<div class="field"><label for="l-minutes">Minutes</label><input id="l-minutes" name="minutes" type="number" min="0" step="1" required /></div>' +
        "</div>" +
        '<div class="field"><label for="l-note">Note (optional)</label><input id="l-note" name="note" type="text" placeholder="e.g. Watched episode 3 of Lupin" /></div>' +
        '<button type="submit" class="primary small">Log Session</button>' +
      "</form></div>"
    );
  }

  function renderApp() {
    var body = mode === "practice" ? renderPractice() : mode === "browse" ? renderBrowse() : mode === "grammar" ? renderGrammar() : mode === "media" ? renderMedia() : renderLog();
    return (
      '<header class="top">' +
      '<div class="title-wrap"><span class="eyebrow">Personal &amp; Private</span><h1>Language Diary</h1><p class="sub">Advanced vocabulary and grammar, kept close.</p></div>' +
      '<div class="top-right">' +
        '<span class="conn">' + (savedFlash ? "Saved" : "Saved Locally") + "</span>" +
        '<button type="button" class="lock-btn" data-action="lock-now">Lock</button>' +
      "</div></header>" +
      renderLangTabs() +
      renderStats() +
      renderModeTabs() +
      body +
      '<footer class="note">Private · End-to-End Encrypted · Stored Only On This Device</footer>'
    );
  }

  function render() {
    var app = document.getElementById("app");
    if (locked || !cryptoKey || !state) {
      app.innerHTML = (envelope && envelope.salt) ? renderUnlockScreen() : renderSetupScreen();
      bindLockEvents();
    } else {
      app.innerHTML = renderApp();
      bindEvents();
    }
  }

  function bindEvents() {
    var app = document.getElementById("app");

    Array.prototype.forEach.call(app.querySelectorAll('[data-action="set-lang"]'), function (btn) {
      btn.addEventListener("click", function () { state.currentLang = btn.getAttribute("data-lang"); browseTopic = null; mediaTypeFilter = null; buildQueue(); render(); });
    });
    Array.prototype.forEach.call(app.querySelectorAll('[data-action="set-mode"]'), function (btn) {
      btn.addEventListener("click", function () { mode = btn.getAttribute("data-mode"); if (mode === "practice") buildQueue(); render(); });
    });

    var revealBtn = app.querySelector('[data-action="reveal"]');
    if (revealBtn) revealBtn.addEventListener("click", function () { revealed = true; render(); });

    var choiceBtns = app.querySelectorAll('[data-action="choose-option"]');
    Array.prototype.forEach.call(choiceBtns, function (btn) {
      btn.addEventListener("click", function () { choicePicked = btn.getAttribute("data-value"); revealed = true; render(); });
    });

    var learningBtn = app.querySelector('[data-action="mark-learning"]');
    if (learningBtn) learningBtn.addEventListener("click", function () {
      var card = currentCard();
      mutate(function () { card.status = "learning"; card.streak = 0; markPracticeDay(); });
      practiceIndex++; revealed = false; setCurrentType(); render();
    });
    var knownBtn = app.querySelector('[data-action="mark-known"]');
    if (knownBtn) knownBtn.addEventListener("click", function () {
      var card = currentCard();
      mutate(function () { card.streak = (card.streak || 0) + 1; card.status = card.streak >= 2 ? "known" : "learning"; markPracticeDay(); });
      practiceIndex++; revealed = false; setCurrentType(); render();
    });

    var practiceKnownBtn = app.querySelector('[data-action="practice-known"]');
    if (practiceKnownBtn) practiceKnownBtn.addEventListener("click", function () { includeKnown = !includeKnown; buildQueue(); render(); });
    var restartBtn = app.querySelector('[data-action="restart-queue"]');
    if (restartBtn) restartBtn.addEventListener("click", function () { buildQueue(); render(); });

    Array.prototype.forEach.call(app.querySelectorAll('[data-action="filter-topic"]'), function (btn) {
      btn.addEventListener("click", function () { browseTopic = btn.getAttribute("data-topic") || null; render(); });
    });
    Array.prototype.forEach.call(app.querySelectorAll('[data-action="filter-media-type"]'), function (btn) {
      btn.addEventListener("click", function () { mediaTypeFilter = btn.getAttribute("data-type") || null; render(); });
    });

    Array.prototype.forEach.call(app.querySelectorAll('[data-action="del-vocab"]'), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        mutate(function () { currentLang().vocab = currentLang().vocab.filter(function (v) { return v.id !== id; }); });
      });
    });
    Array.prototype.forEach.call(app.querySelectorAll('[data-action="del-grammar"]'), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        mutate(function () { currentLang().grammar = currentLang().grammar.filter(function (g) { return g.id !== id; }); });
      });
    });
    Array.prototype.forEach.call(app.querySelectorAll('[data-action="del-media"]'), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        mutate(function () { currentLang().media = currentLang().media.filter(function (m) { return m.id !== id; }); });
      });
    });
    Array.prototype.forEach.call(app.querySelectorAll('[data-action="del-log"]'), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        mutate(function () { currentLang().log = currentLang().log.filter(function (l) { return l.id !== id; }); });
      });
    });

    var vocabForm = app.querySelector('[data-form="add-vocab"]');
    if (vocabForm) vocabForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(vocabForm);
      var term = (fd.get("term") || "").toString().trim();
      var translation = (fd.get("translation") || "").toString().trim();
      if (!term || !translation) return;
      mutate(function () {
        currentLang().vocab.push({
          id: uid("v"), term: term, translation: translation,
          example: (fd.get("example") || "").toString().trim(),
          exampleTranslation: (fd.get("exampleTranslation") || "").toString().trim(),
          topic: (fd.get("topic") || "Custom").toString().trim() || "Custom",
          notes: "", status: "new", streak: 0
        });
      });
    });

    var grammarForm = app.querySelector('[data-form="add-grammar"]');
    if (grammarForm) grammarForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(grammarForm);
      var title = (fd.get("title") || "").toString().trim();
      var body = (fd.get("body") || "").toString().trim();
      if (!title || !body) return;
      mutate(function () {
        currentLang().grammar.push({ id: uid("g"), title: title, body: body, topic: (fd.get("topic") || "General").toString().trim() || "General" });
      });
    });

    var mediaForm = app.querySelector('[data-form="add-media"]');
    if (mediaForm) mediaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(mediaForm);
      var title = (fd.get("title") || "").toString().trim();
      if (!title) return;
      mutate(function () {
        currentLang().media.push({ id: uid("m"), title: title, type: fd.get("type") || "Film", level: (fd.get("level") || "").toString().trim() || "—", note: (fd.get("note") || "").toString().trim() });
      });
    });

    var logForm = app.querySelector('[data-form="add-log"]');
    if (logForm) logForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(logForm);
      var minutes = parseFloat(fd.get("minutes"));
      if (isNaN(minutes) || minutes <= 0) return;
      mutate(function () {
        currentLang().log.push({ id: uid("l"), date: todayISO(), activity: fd.get("activity") || "Other", minutes: round(minutes), note: (fd.get("note") || "").toString().trim() });
        markPracticeDay();
      });
    });

    var lockBtn = app.querySelector('[data-action="lock-now"]');
    if (lockBtn) lockBtn.addEventListener("click", lockNow);
  }

  function mutate(fn) { fn(); render(); doPersist(); }

  function doPersist() {
    if (!cryptoKey) return Promise.resolve();
    return encryptJSON(state, cryptoKey).then(function (enc) {
      envelope = { v: 1, salt: envelope.salt, iv: enc.iv, ct: enc.ct };
      saveEnvelopeToStorage(envelope);
      savedFlash = true;
      var flashEl = document.querySelector(".conn");
      if (flashEl) flashEl.textContent = "Saved";
      setTimeout(function () { savedFlash = false; var el = document.querySelector(".conn"); if (el) el.textContent = "Saved Locally"; }, 1200);
    }).catch(function (err) { console.warn("Language Diary: save failed", err); });
  }

  function init() {
    if (!window.crypto || !window.crypto.subtle) {
      document.getElementById("app").innerHTML = '<div class="lock-wrap"><div class="lock-card"><h1>Can\'t lock this diary here</h1><p class="desc">Your browser doesn\'t support the encryption this needs. Try a current version of Chrome, Safari, Firefox or Edge.</p></div></div>';
      return;
    }
    envelope = getEnvelopeFromStorage();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(function (err) { console.warn("Language Diary: service worker registration failed", err); });
    }
    if (envelope.salt) {
      var remembered = null;
      try { remembered = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      if (remembered) { busy = true; render(); handleUnlock(remembered, true); return; }
    }
    render();
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
