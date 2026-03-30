# 快进 - 项目记忆 (CLAUDE.md)

## 项目概述
这是一款 **iOS 通用浏览器工具**，名称为「快进」，基于 SwiftUI + WKWebView 构建。
用户可以通过粘贴条码列表，配合云端脚本实现网页自动化操作。
**注意：这是一款独立的浏览器工具，与任何第三方平台没有官方协议关系。**
- App 默认主页为 Google（https://www.google.com）
- 未激活用户可当普通浏览器使用，仅执行任务需要序列号

## 技术栈
- **前端**: SwiftUI (iOS 16+)
- **WebView**: WKWebView + WKScriptMessageHandler
- **脚本**: JavaScript（云端加密托管于 GitHub Gist，通过 Railway 服务器解密下发）
- **网络监控**: NWPathMonitor
- **服务器**: Node.js (Express + node:sqlite) 部署在 Railway
- **脚本加密**: AES-256-GCM（Gist 存储加密后的 base64，服务器用 SCRIPT_SECRET 解密）

## 云端脚本地址
- Gist: `pianetaslot-droide/2b67c88036b16c0d4b91a7281748f8d4`
- 文件: `yollgo_script.js`（已加密为 base64，需服务器解密）
- App 通过 POST `/api/script` 获取脚本（需提供有效 license_key + device_id）

## 服务器地址
- Railway: `https://xiadan-server-production.up.railway.app`
- 管理后台: `https://xiadan-server-production.up.railway.app/admin`
- GitHub 仓库: `pianetaslot-droide/xiadan-server`
- Railway 计划: Hobby（$5/月），当前使用中

## 客服信息
- WeChat: `wxid_j09vq9foaq3l22`

---

## 项目结构
```
下单神器/
├── server/                    # 验证服务器（Railway 部署）
│   ├── package.json
│   ├── server.js              # Express API + SQLite
│   ├── encrypted_script.b64   # 加密脚本文件（参考）
│   └── public/
│       └── admin.html         # 管理后台界面
├── BrowserTool/               # Xcode 工程（项目名：快进）
│   ├── 快进.xcodeproj         # Xcode 项目文件
│   └── 快进/                  # 源代码目录
│       ├── XiadanApp.swift        # App入口（struct KuaijinApp）
│       ├── ContentView.swift      # 主界面（速度选择+防呆+任务控制）
│       ├── WebView.swift          # WKWebView 封装
│       ├── OrderLog.swift         # 日志模型 + 统计数据
│       ├── NetworkObserver.swift  # 网络状态监听
│       ├── LicenseManager.swift   # 序列号验证 + Keychain 存储
│       ├── LicenseView.swift      # 激活界面（快进品牌）
│       ├── ProxyManager.swift     # 代理轮换管理
│       ├── SecurityManager.swift  # 防克隆安全检测
│       ├── CellularToggle.swift   # 私有API蜂窝/飞行模式切换
│       ├── Info.plist             # App 配置（显示名：快进）
│       └── Assets.xcassets        # 资源文件
└── 第一版本/                  # 备份
    └── github.txt             # 原始 Gist 脚本（参考）
```

---

## 版本历史

### v1.0 - 初始版本
- 基础 WKWebView 浏览器
- 条码输入 + 搜索 + 加购功能
- 简单防频控（每50个冷却10秒）
- 频控弹窗自动关闭（仅检测 body.innerText）
- 固定2秒搜索间隔

### v2.0 - 全面优化版 (2026-03-15)
**防封控大幅升级：**
- 批次从50→20个，冷却从10秒→30秒
- 搜索间隔从固定2秒改为随机3~6秒（模拟人工节奏）
- 频控触发后指数退避（5s→10s→20s→40s→80s）
- 连续触发5次强制冷却90秒
- **自适应调速系统**：触发频控自动减速（+0.5x），连续成功30次自动提速（-0.2x）
- 增强弹窗检测：覆盖 modal/overlay/ion-alert 等多种DOM选择器
- 增加关键词检测：频繁/请稍后再试/try again

**UI/UX 改进：**
- 状态指示灯（绿色运行/蓝色连接/灰色待机）
- 实时统计面板：成功/无货/跳过/失败 分类计数
- 日志详情页（sheet弹出，可查看全部历史）
- 日志颜色分级（成功绿/失败红/冷却蓝/跳过橙）
- 重置按钮独立显示

**功能增强：**
- 条码自动去重（保留顺序，提示去除数量）
- 任务完成三次震动提醒
- 异常暂停震动提醒
- 断点续传（暂停后可继续）

### v2.1~v2.4 - 弹窗关闭系列修复 (2026-03-15)
- 弹窗关闭升级为7种方法逐级尝试
- MutationObserver 检测弹窗后等100ms渲染完再点按钮
- 搜索重试机制（搜索后对比页面指纹验证）

### v2.5 - 极速模式 (2026-03-15)
- 去掉所有冷却，100%模拟人类最快操作节奏

### v3.0 - 商业化（序列号验证系统）(2026-03-15)
- 序列号生成（XDSQ-XXXX-XXXX-XXXX 格式）
- 设备绑定（一号一机）
- 管理后台 API
- Keychain 持久化
- 7天离线宽限期

### v3.1 - 代理轮换（自动换IP）(2026-03-16)
- ProxyManager.swift 代理列表管理
- iOS 17+ WKWebsiteDataStore.proxyConfigurations 原生代理支持
- 频控自动切换代理

### v3.3~v3.4 - 频控换IP修复 + 飞行模式换IP (2026-03-16)
- 合并 session_reset 和 switch_proxy 逻辑
- 无代理时飞行模式换IP流程

### v3.5 - 全自动批次换IP (2026-03-17)
- 每100个条码自动切换蜂窝数据/飞行模式换IP
- CellularToggle.swift 私有API封装（3级递进）
- NetworkObserver 自动检测网络恢复 → 断点续传

### v4.0 - 品牌升级 + 脚本加密 + 速度选择 (2026-03-18)
**品牌改名：**
- App 名称从「下单神器」改为「快进」
- 副标题：效率天花板浏览工具
- XiadanApp.swift → struct KuaijinApp
- Info.plist CFBundleDisplayName = 快进
- Xcode 项目/Target 已改名为「快进」

**脚本加密系统：**
- Gist 文件改为 AES-256-GCM 加密后的 base64
- Railway 环境变量 SCRIPT_SECRET 存储解密密钥
- 新增 `/api/script` POST 端点：验证许可证 → 解密 → 返回脚本
- App 不再直接从 Gist 拉取，改为通过服务器获取
- 5分钟缓存避免频繁请求 Gist

**速度选择（3档）：**
- 加速：0.4-0.7秒间隔（最快）
- 普通：1-1.5秒间隔
- 慢速：4-4.5秒间隔（不触发批次换IP）
- `@AppStorage("speedMode")` 持久化选择

**条码防呆系统（实时验证）：**
- 粘贴条码时实时显示：有效数量、重复数量、无效数量、校验失败数量
- EAN-13 校验位验证算法
- 最多500个条码限制
- `onChange(of: barcodeInput)` 触发实时验证

**未激活用户体验：**
- 未激活可当普通浏览器使用（主页 Google）
- 仅执行任务按钮受限（显示"激活后使用"）
- 许可证界面改为 sheet 弹出（非全屏门控）

**试用系统：**
- 免费试用1小时（每设备一次）
- trial_devices 表记录已试用设备
- 试用序列号格式：TRIA-XXXX-XXXX-XXXX

**管理后台增强：**
- 客户名称字段（生成时填写 + 改名按钮）
- 试用标签（橙色 badge）
- 搜索支持客户名称
- POST `/api/admin/rename` 修改客户名称

### v4.1 - 免责条款强制 + 条码数量模式 (2026-03-19)
**免责条款：**
- 首次打开App必须同意免责条款才能使用（不可跳过）
- DisclaimerView 独立视图，在 KuaijinApp 层面拦截
- 需滚动到底部才能点击同意按钮
- `@AppStorage("disclaimerAccepted")` 持久化

**条码数量模式（2档）：**
- 100个条码模式：无需快捷指令，不触发自动换IP
- 500个条码模式：需要快捷指令（auto），自动换IP
- 系统自动检测是否安装快捷指令（`shortcuts://` URL scheme）
- 未安装快捷指令时500模式锁住，显示"联系客服解锁"
- `@AppStorage("barcodeMode")` 持久化选择

**速度简化：**
- 移除3档速度选择，只保留普通速度（1-1.5秒间隔）
- autoTask.js 中 `SKIP_BATCH_PAUSE` 根据 `_barcodeMode` 决定

**模拟器测试：**
- 模拟器检测已允许（方便开发测试）

**版本号升级：** v4.0

---

## 开发注意事项
- 每次更新必须同步更新此 CLAUDE.md 的版本历史
- 云端 JS 脚本修改后需同步更新 `Resources/autoTask.js`（仅作参考记录）
- 界面文案避免直接提及任何第三方平台名称（浏览器工具定位）
- **上下文压缩之前必须询问用户是否需要更新 memory 文件**

## 强制规则（必须严格遵守）

- **🔒 防克隆安全系统（SecurityManager.swift）已启用，禁止修改或削弱以下检测：**
  - 模拟器检测（Simulator）：模拟器上直接黑屏锁死
  - 越狱检测（Jailbreak）：检测 Cydia/bash/sshd 等路径 + 沙盒写入测试
  - 调试器检测（Debugger）：sysctl P_TRACED 标志检测
  - 任何安全修改必须经过明确授权，不得以"测试"为由禁用检测逻辑

- **🚫 绝对禁止在 App 内嵌入或使用本地脚本副本。**
  - App 只能通过 `/api/script` 端点从服务器获取 JS 脚本
  - `Resources/autoTask.js` 仅作为版本记录参考，绝对不得被 App 代码加载或执行
  - 服务器是唯一脚本来源。网络不可用时只报错，不回退本地版本
  - 任何修改 `startTask()` 或脚本加载逻辑的操作，必须确保没有 `Bundle.main.url(forResource:)` 调用

- **搜索框不在页面时必须等待重试，绝不能跳过或继续执行后续条码。** 搜索框可能因页面未加载完、弹窗遮挡、网络延迟等原因暂时不存在。任何修改 autoTask.js 的操作都必须保留搜索框重试等待逻辑（当前实现：最多重试10次，每次等500ms，共5秒）。只有在重试耗尽后仍找不到搜索框时，才允许 `auto_pause` 暂停任务。**绝对禁止**在找不到搜索框时直接跳过当前条码或继续下一个条码。
