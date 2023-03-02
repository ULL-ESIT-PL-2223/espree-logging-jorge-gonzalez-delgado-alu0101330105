import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs";

export async function transpile(inputFile, outputFile) {
  let codeString = fs.readFileSync(inputFile, "utf-8");
  fs.writeFileSync(outputFile, addLogging(codeString));
}

export function addLogging(code) {
  const ast = espree.parse(code, { ecmaVersion: 6, loc: true});
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === "FunctionDeclaration") {
        addBeforeCode(node);
      
      } else if(node.type === "FunctionExpression" ||
          node.type === "ArrowFunctionExpression") {
        addBeforeCode(node, parent);
      }
    }
  });
  return escodegen.generate(ast);
}

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
