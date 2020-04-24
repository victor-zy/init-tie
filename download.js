const download = require('download-git-repo');
const path = require('path');


module.exports = function (target) {
  target = path.join(target || '.', 'download-temp')
  return new Promise (function(resolve, reject) {
    repository = 'victor-zy/MOUBAN'
    download(repository,target, (err) => {
      if (err) {
        reject(err)
      } else {
        // 下载的模板存放在一个临时路径中，下载完成后，可以向下通知这个临时路径，以便后续处理
        resolve(target)
      }
    })

  }
  )}
