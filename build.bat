@echo off

REM 构建脚本 - 古建可视化引擎

echo 开始构建古建可视化引擎...
echo ============================

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 1. 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误：安装依赖失败，尝试备用方法...
    call node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
    if %errorlevel% neq 0 (
        echo 错误：安装依赖失败，请检查网络连接
        pause
        exit /b 1
    )
)

echo 2. 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo 错误：构建失败，尝试备用方法...
    call node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
    if %errorlevel% neq 0 (
        echo 错误：构建失败，请检查项目配置
        pause
        exit /b 1
    )
)

echo 3. 构建Electron应用...
echo 注意：如果Electron构建失败，可以直接使用dist目录中的静态文件
call npm run electron:build
if %errorlevel% neq 0 (
    echo 警告：Electron构建失败，但静态文件已生成
    echo 可以直接在浏览器中打开 dist/index.html
)

echo ============================
echo 构建完成！
echo ============================
echo 静态文件位置：dist/index.html
echo 可执行文件位置：release/（如果Electron构建成功）
echo ============================

pause
