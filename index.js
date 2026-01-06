const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

//sacar da conta
async function withdraw() {
  try {
    const { accountName } = await inquirer.prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ]);
    //verifica se a conta existe
    if (!checkAccount(accountName)) {
      return withdraw();
    }    
    const { amount } = await inquirer.prompt([
      {
        name: "amount",
        message: "Quanto você deseja sacar?",
        validate: (amount) => {
        return checkPositiveNumber(amount) || "Por favor, insira um valor numérico positivo.";
      },
      },
    ]);

    const accountData = getAccount(accountName);
    const amountNumber = parseFloat(amount);
    if (amountNumber > accountData.balance) {

      const { option } = await inquirer.prompt([
          {
            type: "list",
            name: "option",
            message: chalk.bgRed.black(
              "\n\nVocê não tem saldo suficiente\n") + ("\nEscolha uma operação a seguir: \n"),
            choices: [
              "Quero sacar outro valor", 
              "Quero consultar meu saldo",
              "Quero encerrar processo",
            ],
          },
        ]);
        if (option === "Quero sacar outro valor") {
           return withdraw();
        }
        else if (option === "Quero encerrar processo") {
         return cancelOperation();
        } else if (option === "Quero consultar meu saldo") {
        return getAccountBalance();
        }
    }
    accountData.balance -= amountNumber;

    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify(accountData, null, 2)
    );
    console.log(
      chalk.green(`\nFoi sacado o valor de R$${amountNumber} da sua conta!\n`)
    );
  } catch (err) {
    console.log(chalk.bgRed.black("Erro ao sacar:"), err);
  }
}
//consulqtar saldo
async function getAccountBalance() {
  try {
    const { accountName } = await inquirer.prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ]);
    //verifica se a conta existe
    if (!checkAccount(accountName)) {
      return getAccountBalance();
    }
    const accountData = getAccount(accountName);
    console.log(
      chalk.bgBlue.black(
        `\nOlá, o saldo da sua conta é de R$${accountData.balance}\n`
      )
    );
  } catch (err) {
    console.log(chalk.bgRed.black("Erro ao consultar saldo:"), err);
  }
}

//depositar na confirmt
async function deposit() {
  try {
    const { accountName } = await inquirer.prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ]);
    //verifica se a conta existe
    if (!checkAccount(accountName)) {
      return deposit();
    }
    const { amount } = await inquirer.prompt([
      {
        name: "amount",
        message: "Quanto você deseja depositar?",
        validate: (value) => {
    if (!checkPositiveNumber(value)) {
       console.log(
              chalk.bgRed.black(
                "\nValor inválido! Digite um número positivo.\n"
              )
            );
        return false;
    } else {
      return true;
    }
  },
      },
    ]);
      
          // const valid = isNaN(parseFloat(value)) || parseFloat(value) <= 0;
          // if (!valid) {
          //   console.log(
          //     chalk.bgRed.black(
          //       "\nValor inválido! Digite um número positivo.\n"
          //     )
          //   );
    //  return true;        
    // } else{
    //       return valid || "Por favor, insira um valor numérico positivo.";
    //     },
    //   },
    // ]);

    //pegar o valor atual da conta e convertendo para número
    const amountNumber = parseFloat(amount);
    addAmount(accountName, amountNumber);
  } catch (err) {
    console.log(chalk.bgRed.black("Erro ao depositar:"), err);
  }
}
async function buildAccount() {
  try {
    const { accountName } = await inquirer.prompt([
      {
        name: "accountName",
        message: "Digite um nome para sua conta:",
      },
    ]);

    //verifica se existe, se não, cria a pasta
    if (!fs.existsSync("accounts")) {
      fs.mkdirSync("accounts");
    }
    // verificando se o nome conta já existe
    if (fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(
        chalk.bgRed.black("\nEssa conta já existe, escolha outro nome!\n")
      );
      return;
    }
    // criando arquivo da conta
    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify({ balance: 0 }, null, 2)
    );

    console.log(chalk.green("\nParabéns, sua conta foi criada com sucesso!\n"));
  } catch (err) {
    console.log(chalk.bgRed.black("Erro ao criar conta:"), err);
  }
}

async function createAccount() {
  console.log(
    chalk.bgGreen.black("\n\nAgradecemos por você escolher nosso banco!")
  );
  console.log(chalk.green("\nDefina as opções da sua conta a seguir:"));
  await buildAccount();
}

//menu
async function operation() {
  while (true) {
    try {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "O que você deseja fazer?",
          choices: [
            "Criar conta",
            "Consultar saldo",
            "Depositar",
            "Sacar",
            "Sair",
          ],
        },
      ]);

      if (action === "Criar conta") {
        await createAccount();
      } else if (action === "Consultar saldo") {
        await getAccountBalance();
      } else if (action === "Depositar") {
        await deposit();
      } else if (action === "Sacar") {
        await withdraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("\n\nObrigado por usar o Accounts!"));
        process.exit();
      }
    } catch (err) {
      console.log(chalk.bgRed.black("Erro no menu:"), err);
    }
  }
}
function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("\nEssa conta não existe, escolha outro nome!\n")
    );
    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData, null, 2)
  );
  console.log(
    chalk.green(`\nFoi depositado o valor de R$${amount} na sua conta!\n`)
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}

function checkPositiveNumber(value) {
  const number = parseFloat(value);
  return !isNaN(number) && number > 0;
}

function cancelOperation(option) {
  console.log(chalk.bgBlue.black("\n\nOperação cancelada pelo usuário."));
  process.exit();
}

operation();
