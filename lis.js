function Env(obj) {
  var env = {};
  var outer = obj.outer || {};
  if (obj.parms.length != 0) {
    for (var i = 0; i < obj.parms.length; i += 1)
      env[obj.parms[i]] = obj.args[i];
  }
  env.find = function (variable) {
    if (variable in env) return env;
    // if (Object.entries(outer).length === 0) return env;
    else return outer.find(variable);
  };
  return env;
}

function add_globals(env) {
  // add some Scheme standard procedures to an environment
  env["+"] = function (a, b) {
    return a + b;
  };
  env["-"] = function (a, b) {
    return a - b;
  };
  env["*"] = function (a, b) {
    return a * b;
  };
  env["/"] = function (a, b) {
    return a / b;
  };
  env[">"] = function (a, b) {
    return a > b;
  };
  env["<"] = function (a, b) {
    return a < b;
  };
  env[">="] = function (a, b) {
    return a >= b;
  };
  env["<="] = function (a, b) {
    return a <= b;
  };
  env["=="] = function (a, b) {
    return a == b;
  };
  env["%"] = function (a, b) {
    return a % b;
  };
  env["يساوي؟"] = function (a, b) {
    return a == b;
  };
  //   env["eq?"] = function (a, b) {
  //     return a == b;
  //   };
  env["ليس؟"] = function (a, b) {
    return !a;
  };
  env["طول"] = function (a, b) {
    return a.length;
  };
  env["اضافة"] = function (a, b) {
    return a.concat(b);
  };
  env["اول"] = function (a, b) {
    return a.length !== 0 ? a[0] : null;
  };
  env["الباقي"] = function (a, b) {
    return a.length > 1 ? a.slice(1) : null;
  };
  //   env["اطبع"] = function (...args) {
  //     return args.join(" ");
  //   };
  //   env["append"] = function (a, b) {
  //     return a.concat(b);
  //   };
  env["مصفوفة"] = function () {
    return Array.prototype.slice.call(arguments);
  };
  env["مصفوفة؟"] = function (a) {
    return a instanceof Array;
  };
  env["فارغ؟"] = function (a) {
    return a.length == 0;
  };
  env["حرف؟"] = function (a) {
    return typeof a == "string";
  };
  return env;
}

var global_env = add_globals(Env({ parms: [], args: [], outer: undefined }));

// eval..................................................................

function eval(x, env) {
  // function to evaluate an expression in an evironment
  env = env || global_env;
  if (typeof x == "string") {
    try {
      return env.find(x.valueOf())[x.valueOf()];
    } catch {
      return "not defined";
    }
  }
  if (typeof x == "function") return env.find(x.valueOf())[x.valueOf()];
  else if (typeof x == "number") return x;
  else if (x[0] == "هو" || x[0] == "اطبع")
    return x.slice(1).reverse().join(" ");
  else if (x[0] == "اذا") {
    var test = x[1];
    var conseq = x[2];
    var alt = x[3];
    if (eval(test, env)) return eval(conseq, env);
    else return eval(alt, env);
  } else if (x[0] == "!ضع") env.find(x[1])[x[1]] = eval(x[2], env);
  else if (x[0] == "عرف") env[x[1]] = eval(x[2], env);
  else if (x[0] == "اكتب") console.log(x[1]);
  else if (x[0] == "وظيفة") {
    var vars = x[1];
    var exp = x[2];
    return function () {
      return eval(exp, Env({ parms: vars, args: arguments, outer: env }));
    };
  } else if (x[0] == "توظيفة") {
    var vars = x[2];
    var exp = x[3];
    env[x[1]] = function () {
      return eval(exp, Env({ parms: vars, args: arguments, outer: env }));
    };
  } else if (x[0] == "ابدء") {
    var val;
    for (var i = 1; i < x.length; i += 1) val = eval(x[i], env);
    return val;
  } else {
    var exps = [];
    for (i = 0; i < x.length; i += 1) exps[i] = eval(x[i], env);
    var proc = exps.shift();
    try {
      return proc.apply(env, exps);
    } catch {
      return "syntax error or function not defined";
    }
  }
}

// parse..................................................................

function parse(s) {
  // Read a scheme expression from a string.
  console.log(tokenize(s));
  try {
    return read_from(tokenize(s));
  } catch {
    return "Unexpected EOF while reading, no ) found";
  }
}

function tokenize(s) {
  // flip parentheses and reverse string then Convert a string into list of tokens.
  return s
    .replace(/\)/g, " )@@ ")
    .replace(/\(/g, " ) ")
    .replace(/\)@@/g, " ( ")
    .trim()
    .split(/\s+/)
    .reverse();
}

function read_from(tokens) {
  // Read an expression from a sequence of tokens.
  if (tokens.length == 0) {
    // console.log()
    throw Error("Unexpected EOF while reading");
  }
  var token = tokens.shift();
  if ("(" == token) {
    var L = [];
    while (")" != tokens[0]) L.push(read_from(tokens));
    tokens.shift();
    return L;
  } else {
    if (")" == token) console.log("Unexpected )");
    else return atom(token);
  }
}

function atom(token) {
  if (isNaN(token)) return token;
  else return parseFloat(token);
}

// examples..................................................................

program = "(اهلا يا عالم اطبع)";
console.log(eval(parse(program)));

program = "((و ((ز هو) و عرف) ابدء)";
console.log(eval(parse(program)));

program = "(2 8 *)";
console.log(eval(parse(program)));

// "(if (< 10 20) 10 20)";
program = "(10 20 (3 5 >) اذا)";
console.log(eval(parse(program)));

program = "((7 7 2 8 مصفوفة) اول)";
console.log(eval(parse(program)));

program = "((7 7 2 8 مصفوفة) الباقي)";
console.log(eval(parse(program)));

// "(begin (define r 3) (* 3.14 (* r r)))";
program = "((ز ز *) (5 ز عرف) ابدء)";
console.log(eval(parse(program)));

// "((lambda (foo) (* foo 3)) 10)";
program = "(10 ((10 متغير *) (متغير) وظيفة))";
console.log(eval(parse(program)));

program = "((10 متغير *) (متغير) و توظيفة)";
console.log(eval(parse(program)));

program = "(9 و)";
console.log(eval(parse(program)));
