@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ==============================================
echo 开始构建项目...
echo ==============================================

echo [1/2] 正在构建锐界幻境文档站项目...
call pnpm run build
if !errorlevel! neq 0 (
    echo 锐界幻境文档站项目构建失败！
    pause
    exit /b 1
)

echo [2/2] 正在移动锐界幻境文档站项目构建文件...
if not exist ".\build\" mkdir ".\build\"

:: 使用 xcopy 复制文件（如果成功，再删除源目录）
xcopy /E /Y /I ".\.vitepress\dist\*" ".\build\"
if !errorlevel! gtr 1 (
    echo 锐界幻境文档站文件移动失败！
    pause
    exit /b 1
) else (
    rem 复制成功后删除原构建目录
    if exist ".\.vitepress\dist\" (
        rmdir /s /q ".\.vitepress\dist"
        if !errorlevel! neq 0 (
            echo 删除原构建目录失败！
            pause
            exit /b 1
        ) else (
            echo 原构建目录已删除。
        )
    )
)

echo ==============================================
echo 所有项目构建并复制完成！
echo ==============================================

:: 返回到原始目录
cd /d ".."

echo 构建文件位置：
echo - 锐界幻境文档站：.\build\

pause
endlocal