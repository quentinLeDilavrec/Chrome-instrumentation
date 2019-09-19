"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// CAUTION don't move out inner fcts of instrumenter_container, 
// instrumenter_container is serialized to be included in the first function 
// executed at each page load (Mutation Observer, initialize logger hook) 
function instrumenter_container(URL) {
    return function (Babel) {
        let i = 0;
        const btypes = Babel.types;
        function param2exp(param) {
            if (param.type === 'Identifier') {
                return param;
            }
            else if (param.type === 'ObjectPattern') {
                const l = [];
                param.properties.forEach((x) => {
                    if (x.type === 'RestElement') {
                        l.push(btypes.spreadElement(x.argument));
                    }
                    else if (x.value.type === 'AssignmentPattern') {
                        l.push(btypes.objectProperty(x.key, x.key));
                    }
                    else {
                        l.push(btypes.objectProperty(x.key, param2exp(x.value)));
                    }
                });
                return btypes.objectExpression(l);
            }
            else if (param.type === 'ArrayPattern') {
                return btypes.arrayExpression(param.elements.filter((x) => x !== null).map(param2exp));
            }
            else if (param.type === 'RestElement') {
                return btypes.spreadElement(param.argument);
            }
            else if (param.type === 'AssignmentPattern') {
                return param.left;
            }
            throw param.type;
        }
        function makeLoggerExpr(currFile, ...params) {
            // path, fnVal,
            // btypes.stringLiteral( path ),
            // fnVal,
            return btypes.expressionStatement(btypes.callExpression(btypes.identifier('globalThis.logger.push'), [
                btypes.arrayExpression([
                    btypes.stringLiteral(currFile || URL),
                    ...params,
                ]),
            ]));
        }
        return {
            name: 'log-functions-usage',
            visitor: {
                FunctionDeclaration(path) {
                    // TODO check if another logger call in same block or chidren which doesn't go though function declarations
                    // TODO try to mark the outputed code so that it won't be instrumented 2 times
                    path.node.body.body.unshift(makeLoggerExpr(this.file.opts.filename, btypes.spreadElement(btypes.identifier('arguments'))));
                },
                FunctionExpression(path) {
                    path.node.body.body.unshift(makeLoggerExpr(this.file.opts.filename, btypes.spreadElement(btypes.identifier('arguments'))));
                },
                ArrowFunctionExpression(path) {
                    const v = makeLoggerExpr(this.file.opts.filename, ...path.node.params.map(param2exp));
                    if (path.node.body.type === 'BlockStatement') {
                        path.node.body.body.unshift(v);
                    }
                    else {
                        path.node.body = btypes.blockStatement([v, btypes.returnStatement(path.node.body)]);
                    }
                },
                ObjectMethod(path) {
                    path.node.body.body.unshift(makeLoggerExpr(this.file.opts.filename, btypes.spreadElement(btypes.identifier('arguments'))));
                },
                ClassMethod(path) {
                    path.node.body.body.unshift(makeLoggerExpr(this.file.opts.filename, btypes.spreadElement(btypes.identifier('arguments'))));
                },
                ClassPrivateMethod(path) {
                    path.node.body.body.unshift(makeLoggerExpr(this.file.opts.filename, btypes.spreadElement(btypes.identifier('arguments'))));
                },
            }
        };
    };
}
exports.instrumenter_container = instrumenter_container;
//# sourceMappingURL=instrumentation.js.map