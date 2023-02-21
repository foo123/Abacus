@echo off

REM ###################################################
REM #
REM #   The buildtools repository is at:
REM #   https://github.com/foo123/Beeld
REM #
REM ###################################################

REM to use the python build tool do:
rem python %BUILDTOOLS%\Beeld.py --config ".\beeld.config"

REM to use the php build tool do:
rem php -f %BUILDTOOLS%\Beeld.php --  --config=".\beeld.config"

REM to use the node build tool do:
node %BUILDTOOLS%\Beeld.js  --config ".\beeld.config"
