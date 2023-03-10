import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs";

/**
 * It reads the contents of the input file, adds logging to it, and writes the result to the output
 * file
 * @param inputFile - The path to the file to transpile.
 * @param outputFile - The file to write the transpiled code to.
 */
export async function transpile(inputFile, outputFile) {
  let codeString = fs.readFileSync(inputFile, "utf-8");
  fs.writeFileSync(outputFile, addLogging(codeString));
}

/**
 * It adds a line of code to the beginning of every function declaration, function expression, and
 * arrow function expression
 * @param code - The code to be instrumented.
 * @returns The code with the logging added.
 */
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

/**
 * It takes a function node and a parent node, and adds a console.log statement to the beginning of the
 * function body
 * @param node - the node that we're adding the code to
 * @param parent - the parent node of the function node
 */
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
