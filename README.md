# resign-apk
使用electron做的一个小工具, 用于对加壳后的apk重新进行签名, 批量重新签名.

公司有与第三方公司合作, 开发好的各个市场以及各个渠道安卓安装包都需要给第三方公司进行加壳加固, 加固完还要再重新进行签名, 每次升级工作量都挺大, 于是自己做了一个批量重新签名的小工具.

主要使用了electron负责界面部分, 使用child_process直接调用jar命令对apk进行解压,删除META-INF,重新打包APK并使用jarsigner对重新打包后的apk进行签名.

目前仅在MACOS下使用.
