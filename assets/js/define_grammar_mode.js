function codemirror_define_grammar_mode( language, grammar, options, CodeMirror, CodeMirrorGrammar )
{
    "use strict";

    CodeMirror = CodeMirror || window.CodeMirror;
    CodeMirrorGrammar = CodeMirrorGrammar || window.CodeMirrorGrammar;
    options = options || {};
    var mode = null;

    if ( CodeMirror && CodeMirrorGrammar )
    {
        // 2. parse the grammar into a Codemirror syntax-highlight mode
        mode = CodeMirrorGrammar.getMode( grammar );
        mode.supportGrammarAnnotations = options.supportGrammarAnnotations ? true : false;
        mode.supportCodeFolding = options.supportCodeFolding ? true : false;
        mode.supportCodeMatching = options.supportCodeMatching ? true : false;
        mode.supportAutoCompletion = options.supportAutoCompletion ? true : false;

        // 3. register the mode with Codemirror
        CodeMirror.defineMode(language, mode);
        if ( mode.supportGrammarAnnotations )
        {
            CodeMirror.registerHelper("lint", language, mode.validator);
        }
        if ( mode.supportCodeFolding )
        {
            CodeMirror.registerHelper("fold", /*language+"-mode-fold"*/mode.foldType, mode.folder);
        }
        if ( mode.supportCodeMatching )
        {
            CodeMirror.defineOption(language+"-mode-match", false, function( cm, val, old ) {
                if ( old && old != CodeMirror.Init )
                {
                    cm.off( "cursorActivity", mode.matcher );
                    mode.matcher.clear( cm );
                }
                if ( val )
                {
                    cm.on( "cursorActivity", mode.matcher );
                    mode.matcher( cm );
                }
            });
        }
        if ( mode.supportAutoCompletion )
        {
            mode.autocompleter.options = options.autocompleter || {prefixMatch:true, caseInsensitiveMatch:false, inContext:false, dynamic:false};
            CodeMirror.commands[language+"-mode-autocomplete"] = function( cm ) {
                CodeMirror.showHint(cm, mode.autocompleter);
            };
        }
        /*if ( options.supportToggleComments )
        {
            CodeMirror.commands[language+"-mode-togglecomments"] = function( cm ) {
                cm.toggleComment( mode )
            };
        }*/
        if ( options.mime )
        {
            if ( options.mime.forEach )
                options.mime.forEach(function(mime){
                    CodeMirror.defineMIME(mime, language);
                });
            else
                CodeMirror.defineMIME(options.mime, language);
        }
        if ( options.mix )
        {
            CodeMirror.defineMIME(options.mix.mime||("application/x-"+language), {name:options.mix.mode, scriptingModeSpec:language, scriptStartRegex:options.mix.start, scriptEndRegex:options.mix.end});
        }
    }
    else
    {
        window[language + "_grammar"] = grammar;
    }
}