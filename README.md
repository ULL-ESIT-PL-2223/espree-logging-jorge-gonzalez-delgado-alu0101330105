[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-f4981d0f882b2a3f0472912d15f9806d57e124e0fc890972558857b51b24a6f9.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=10341976)

# Espree Loggin

## Introduction
In this module is an example of how to edit your code based in some rules you make. In this case what we made was introduce a log message at the start of every function to see with which params and in what order the functions are entered.

## Espree
To make this happen we hace to use the reverse operation of the escodegen: espree.parse, a module that takes a code string and transforms it into an ast, just like we did in the previous assingments but better in every single way imaginable.

```javascript
  const ast = espree.parse(code, { ecmaVersion: 6, loc: true});
```
We must also define the `ecmaVersion` for functionality and code compatibility, and we also turn on the localization, this will make so the ast stores the coordenates in the file of everything:
```json
"expression": {
  "type": "Literal",
  "start": 0,
  "end": 1,
  "loc": {   // ← this thing
    "start": {
      "line": 1,
      "column": 0
    },
    "end": {
      "line": 1,
      "column": 1
    }
  },
  "value": 3,
  "raw": "3"
}
```
We will make use of them later, but first, we need a way to navigate through the ast without needing to resort to directly eddit it like a string, thats where estraverse comes in.

## Estraverse
Estraverse are the EcmaScript traversal functions from esmangle project, for short functions to traverse and edit ast easily. Using the `estraverse.traverse` function we can traverse all the nodes inside the ast and define certain behaviours on certain actions like on enter or exit.

We will define the `enter` behaviour so the code can detect when we are inside a function of some sort, so we can call the `addBeforeCode()` function:
```js
export function addLogging(code) {
  const ast = espree.parse(code, { ecmaVersion: 6, loc: true});
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === "FunctionDeclaration" ||
          node.type === "FunctionExpression" ||
          node.type === "ArrowFunctionExpression") {
        addBeforeCode(node, parent);
      }
    }
  });
  return escodegen.generate(ast);
}
```
We do not define an exit behaviour and just return the modified ast, but How did we modified it?

## Editing ast
The first thing we must do is obtain the information we will need from the node itself. For our aplication we will be needing the name and the parameters of the function to properly log it, easy so far, but we encounter our first problem rigth here:

```js
let func = function(x) {
  return x + 1;
}
```
The node that triggers our node type filter is the `FunctionExpression` wich does not have an id where we could find the name, but it definetly have a name since we could invoque it by typing `func()`. The problem is that we are looking in the wrong node, the one that actually has the function id is the parent node which is a `VariableDeclarator` with the actual function id. The way we get that id is telling the `estraverse.traverse` to give us not only the actual node but also the parent on `enter`, we just pass both nodes to the `addBeforeCode()` function and check wheter the actual node or the parent has the id, in case neither has an id (commonly arrow functions), it would be just called `<anonymous function>`.

Once we've got the name from `id.name` we algo store the `loc.start.line` to tell in which line the function is in the ORIGINAL file, since it would not match once we modify it. The last thing we need are the parameters the function was called with, since its an array we will get all of them but first add a little change to them:

In order to show a variable inside a string, we must use the backtick string:
```js
`this type of string
with multiline suport`
```
Because the add support for Tagged Templates, wich is a fancy way to say that you can embed a variable inside the string:
```js
const x = "this"
`like ${x}`
```
So we just set the parameters up so we can directly add them into a string adding them the `${` and `}`.

To modify the node we need something to modify it with, in our case a console log where we just paste all together inside and call it a day, then we parse it back into an ast node (the console.log) and stuff it rigth at the start of the function body, the `node.body.body`:

```js
function addBeforeCode(node, parent) {
  let name = node.id ? node.id.name : parent.id ? parent.id.name : "<anonymous function>";
  let params = [];
  if (node.params.length > 0) {
    params = "${" + node.params.map(param => param.name).join("}, ${") + "}";
  }
  
  const lineN = node.loc.start.line;
  const beforeCode = "console.log(`Entering " + name + "(" + params + ") at line " + lineN + "`);";
  const beforeNodes = espree.parse(beforeCode, {ecmaVersion: 12}).body;
	node.body.body = beforeNodes.concat(node.body.body);
}
```

## Test Coverage and Documentation
The same business as always, testing with Jest like we did in the last repo (check it [here](https://github.com/ULL-ESIT-PL-2223/hello-compilers-jorge-gonzalez-delgado-alu0101330105#testing-with-jest)) and the coverage that is built inside Jest. This time we also brough the Documentation page made with JSDoc.

JSDoc takes comments above functions and makes a very functional html page with all the information given in the comments check it here.