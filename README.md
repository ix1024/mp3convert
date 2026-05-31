
# mp3convert v2

## 功能

- 批量音视频转 MP3（ffmpeg）
- 并发队列
- 进度条
- 暂停 / 恢复（键盘控制）
- 成功/失败统计

## 安装

```bash
npm install
npm run build
npm link
```

## 使用

### 默认（当前目录）
```bash
mp3convert
```

### 指定目录
```bash
mp3convert -i ./A -o ./B -q 192k -p 3
```

## 控制

运行过程中：

- `p` 暂停
- `r` 恢复

## 输出示例

```
进度 |███████---| 7/10 | 70%
```

## 依赖

- ffmpeg（必须安装）
