const Modal = {
    open(){
       document
           .querySelector('.modal-overlay')
           .classList
           .add('active')
    },
    close(){
       document
           .querySelector('.modal-overlay')
           .classList
           .remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('Transactions')) || []
    },

    set(transactions){
        localStorage.setItem('Transactions', JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        console.log(Transaction.all)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0
        
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })

        return income
    },
    expenses(){
        let expense = 0
        
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount
            }
        })

        return expense
    },
    total(){
        let total = Transaction.incomes() + Transaction.expenses()

        return total
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="/assets/minus.svg" alt="Excluir">
            </td>
        `

        return html
    },
    
    updateBalance(){
        document
            .querySelector('#income-display')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .querySelector('#expense-display')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .querySelector('#total-display')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value) * 100

        return value
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'})

        return signal + value
    },

    formatDate(date){
        const splitedDate = date.split("-")
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`   
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,  
        }
    },

    validateFields(){
        //desestruturando o objeto retornado pelo getValues()
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {                    
            description,
            amount,
            date
        }

        /*return {
            description: description,
            amount: amount,
            date: date
        }*/
    },

    clearTransactions(){
        Form.getValues().description = ""
        Form.getValues().amount = ""
        Form.getValues().date = ""
    },

    submit(event){
        event.preventDefault() //não faça o padrão, ou seja, não mude a URL ao dar submit.
        try{
            console.log(Form.getValues())
            Form.validateFields()
            const transaction = Form.formatValues() 
            Transaction.add(transaction)
            Form.clearTransactions()
            Modal.close()
         }catch (error){
             alert(error.message)
         }  
    }
}

const App = {
    init(){
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
            }
        )
    
        DOM.updateBalance()

        Storage.set(Transaction.all)
    
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

