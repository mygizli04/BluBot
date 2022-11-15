import chalk from 'chalk';
import sleep from './sleep.js';

let minimal = false

async function motd(tag?: string) {
  !minimal && console.clear()
  const ascii = `______ _      ______       _   
| ___ \\ |     | ___ \\     | |  
| |_/ / |_   _| |_/ / ___ | |_ 
| ___ \\ | | | | ___ \\/ _ \\| __|
| |_/ / | |_| | |_/ / (_) | |_ 
\\____/|_|\\__,_\\____/ \\___/ \\__|
===============================
`.split('\n')
  for (let line of ascii) {
    console.log(chalk.hex('#0064FF')(line))
    await sleep(50)
  }
  tag && console.log(`Welcome to BluBot! Your bot (${tag}) is now running.`)
  console.log(minimal ? 'Press h and hit Enter for help.' : 'Press h for help.')
}

const commands = {
  h: () => {
    console.log(`
  [h] Show this help page
  [m] Show the MOTD
  [u] Show uptime
  [q] Quit
    `)
  },
  m: motd,
  u: () => {
    let uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    uptime %= 3600
    const minutes = Math.floor(uptime / 60)
    const seconds = Math.floor(uptime % 60)
    console.log(chalk.yellow(`\nUptime: ${hours ? `${hours} hours, ` : ''}${minutes ? `${minutes} minutes and ` : ''}${seconds} seconds.`))
  },
  q: () => {
    console.log('Goodbye!')
    process.exit()
  }
}

export default {
  init: () => {
    if (process.argv[2] === '--minimal') minimal = true
    !minimal && console.clear()
    console.log(chalk.yellow('Starting BluBot...'))
    if (!minimal) {
      process.stdin.setRawMode?.(true)
      process.stdin.resume()
      process.stdin.setEncoding('utf8')

      process.stdin.on('data', key => {
        const keyStr = key.toString();
        if (keyStr === '\u0003') process.exit()
        // If the key isn't a key of commands, ignore it
        if (Object.keys(commands).includes(keyStr)) {
          return commands[keyStr as keyof typeof commands]()
        }
      })
    } else {
      process.stdin.on('data', line => {
        const lineStr = line.toString().trim()
        if (Object.keys(commands).includes(lineStr)) {
          return commands[lineStr as keyof typeof commands]()
        }
      })
    }
  },
  motd
}
