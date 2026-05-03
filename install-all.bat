@echo off
chcp 65001 >nul
echo ========================================
echo   中国古代建筑可视化 - 桌面应用打包
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 清理旧的 node_modules 和 dist...
if exist node_modules (
    echo    删除 node_modules (这可能需要一些时间)...
    rmdir /s /q node_modules 2>nul
    if exist node_modules (
        echo    使用 PowerShell 强制删除...
        powershell -NoProfile -Command "Remove-Item -Recurse -Force node_modules"
    )
)
if exist package-lock.json del package-lock.json
if exist dist rmdir /s /q dist
echo    清理完成!
echo.

echo [2/3] 安装所有依赖...
echo    正在下载 electron (~150MB)，请耐心等待...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo    [错误] npm install 失败!
    echo    请检查网络连接后重试
    pause
    exit /b 1
)
echo.
echo    安装完成!
echo.

echo [3/3] 验证安装...
node -e "try{require('electron/package.json');console.log('  Electron: OK')}catch(e){console.log('  Electron: MISSING');process.exit(1)}"
node -e "try{require('electron-builder/package.json');console.log('  electron-builder: OK')}catch(e){console.log('  electron-builder: MISSING');process.exit(1)}"
node -e "try{require('app-builder-bin/package.json');console.log('  app-builder-bin: OK')}catch(e){console.log('  app-builder-bin: MISSING');process.exit(1)}"
echo.

if %errorlevel% neq 0 (
    echo    [错误] 依赖安装不完整，请重试
    pause
    exit /b 1
)

echo ========================================
echo   环境安装完成!
echo ========================================
echo.
echo 下一步:
echo   1. 运行 build-app.bat 进行桌面应用打包
echo   2. 生成的 .exe 文件将在 dist-electron 目录中
echo.
pause
