/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 *
 * ì¸ã‡ï\Ç®ÇÊÇ—édñÛí†Çê∂ê¨Ç∑ÇÈ
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */

define(['N/search', 'N/record', 'N/runtime'],
  function(search, record, runtime) {
    function execute(context) {
      var id = runtime.getCurrentScript().getParameter("custscripthead_id");
      var accountId = runtime.getCurrentScript().getParameter("custscript_customerpayment_account_id");
      try{
        log.audit({
          title: 'Create record',
          details: 'Create start '+id
        });
        //var id = context.parameters.head_id;
        var headRecord = record.load({
            type : 'customrecord_sii_custpayment_h',
            id : id,
            isDynamic: true
        });
        var settingList = getSetting();
        var setting = settingList.getRange({
            start: 0,
            end: 1
        })[0];
        var saveAcc = headRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_acc'});
        if(isEmpty(saveAcc)){
            saveAcc = setting.getValue({name: 'custrecord_sii_custpayment_setting_acc'});
        }
        var saveError = headRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_error'});
        if(isEmpty(saveError)){
            saveError = setting.getValue({name: 'custrecord_sii_custpayment_setting_error'});
        }
        var saveTaxCo = headRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_taxco'});
        if(isEmpty(saveAcc)){
            saveTaxCo = setting.getValue({name: 'custrecord_sii_custpayment_setting_taxco'});
        }
        var savePlus = headRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_plus'});
        if(isEmpty(savePlus)){
            savePlus = setting.getValue({name: 'custrecord_sii_custpayment_setting_plus'});
        }
        var nowDate = getNowDateJP();
        var numLines = headRecord.getLineCount({
            sublistId: 'recmachcustrecord_sii_custpayment_h_id'
        });
        var feeList = getFee();
        var invoiceList = getInvoice();
        for(var i = 0; i < numLines; i++ ){
            var saving = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                fieldId: 'custrecord_sii_custpayment_saving',
                line: i
            });
            var depositnum = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                fieldId: 'custrecord_sii_custpayment_depositnum',
                line: i
            });
            var exclusion = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                fieldId: 'custrecord_sii_custpayment_exclusion',
                line: i
            });
            if(!exclusion){
                var customerno = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_customerno',
                    line: i
                });
                var client = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_client',
                    line: i
                });
                var paymentamo = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_paymentamo',
                    line: i
                });
                var claimsum = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_claimsum',
                    line: i
                });
                var client_half = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_client_half',
                    line: i
                });
                invoiceList.each(function(result) {
                    entity = result.getValue(invoiceList.columns[0]);
                    amount = result.getValue(invoiceList.columns[1]);
                    if(entity == client){
                        claimsum = amount;
                    }
                    return true;
                })
                var match = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_match',
                    line: i
                });
                var consumption = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_consumption',
                    line: i
                });
                var fee = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                    fieldId: 'custrecord_sii_custpayment_fee',
                    line: i
                });
                var feeSum;
                var feeID;
                var feeBase;
                var erorrParam;
                if(claimsum == paymentamo){
                    match = true;
                    erorrParam = 0;
                }else{
                    var erorr = claimsum - paymentamo;
                    feeList.each(function(result) {
                        var baseFee = result.getValue({name: 'custrecord_sii_custfee_base'});
                        var sumFee = result.getValue({name: 'custrecord_sii_custfee_sum'});
                        if(sumFee == erorr){
                            fee = true;
                            feeSum = sumFee;
                            feeID = result.id; 
                            feeBase = baseFee;
                        }else{
                            if(Math.abs(erorr) <= saveError){
                                consumption = true;
                                erorrParam = erorr;
                            }
                            if(Math.abs(erorr - sumFee) <= saveError){
                                consumption = true;
                                fee = true;
                                erorrParam = erorr - sumFee;
                                feeSum = sumFee;
                                feeID = result.id;
                                feeBase = baseFee;
                            }
                        }   
                        return true;
                    });
                }
                if(!isEmpty(saving)){
                    var customerPaymentRecord  = null;
                    saving = JSON.parse(saving);
                    if(!isEmpty(saving.invoice)){
                        invoicesArray = saving.invoice;
                        var customerPaymentRecord = record.transform({
                            fromType: 'invoice',
                            fromId: invoicesArray[0].id,
                            toType: 'customerpayment'
                        });
                        var invoiceRecord = record.load({
                            type: 'invoice',
                            id: invoicesArray[0].id
                        });
                        if(!isEmpty(invoiceRecord.getValue({fieldId: 'department'}))){
                            customerPaymentRecord.setValue({
                                fieldId: 'department',
                                value: invoiceRecord.getValue({fieldId: 'department'})
                            });
                        }
                        if(!isEmpty(client_half)){
                            customerPaymentRecord.setValue({
                                fieldId: 'custbody_hankakukana_name',
                                value: client_half
                            });
                        }
                        customerPaymentRecord.setValue({
                            fieldId: 'account',
                            value: accountId
                        });
                        customerPaymentRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: 0
                        });
                        for(var k = 0; k < invoicesArray.length; k++){
                            for(var j = 0; j < invoicesArray.length; j++){
                                var internalid = customerPaymentRecord.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'internalid',
                                    line: k
                                });
                                if(internalid == invoicesArray[j].id){
                                    var invoiceRecord = record.load({
                                        type: 'invoice',
                                        id: invoicesArray[j].id
                                    });
                                    var feeValue = 0;
                                    var calculationValue = 0;
                                    var adjustment = 0;
                                    if(!isEmpty(saving.feeValue)){
                                        feeValue = getInt(saving.feeValue);
                                    }
                                    if(!isEmpty(saving.calculationValue)){
                                        calculationValue = getInt(saving.calculationValue);
                                    }
                                    if(!isEmpty(invoicesArray[j].adjustment)){
                                        adjustment =  getInt(invoicesArray[j].adjustment);
                                    }
                                    var feeBase = feeValue / 108 * 100;
                                    /*customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'internalid',
                                        line: k,
                                        value: invoiceRecord.id
                                    });*/
                                    if(invoicesArray[j].check == 'T'){
                                        customerPaymentRecord.setSublistValue({
                                            sublistId: 'apply',
                                            fieldId: 'applydate',
                                            line: k,
                                            value: invoiceRecord.getValue({fieldId: 'saleseffectivedate'})
                                        });
                                        customerPaymentRecord.setSublistValue({
                                            sublistId: 'apply',
                                            fieldId: 'apply',
                                            line: k,
                                            value: true
                                        });
                                        customerPaymentRecord.setSublistValue({
                                            sublistId: 'apply',
                                            fieldId: 'amount',
                                            line: k,
                                            value: invoicesArray[j].applied
                                        });
                                        var invoiceAccount = invoiceRecord.getValue({fieldId: 'account'});
                                        if(invoicesArray[j].check_2 == 'T'){
                                            customerPaymentRecord.setSublistValue({
                                                sublistId: 'apply',
                                                fieldId: 'disc',
                                                line: k,
                                                value: feeValue+calculationValue+adjustment
                                            });
                                            var journalId = createJournal(invoiceAccount, entity, calculationValue, savePlus, saveAcc, feeValue, feeBase, saveTaxCo);
                                            if(journalId != 0){
                                                var lineNum = headRecord.selectLine({
                                                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                                    line: i
                                                });
                                                headRecord.setCurrentSublistValue({
                                                    sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                                    fieldId: 'custrecord_sii_custpayment_link_jou',
                                                    value: journalId
                                                });
                                                headRecord.commitLine({
                                                    sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                                                });
                                            }
                                        }else{
                                            customerPaymentRecord.setSublistValue({
                                                sublistId: 'apply',
                                                fieldId: 'disc',
                                                line: k,
                                                value: adjustment
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        customerPaymentRecordId = customerPaymentRecord.save();
                        var lineNum = headRecord.selectLine({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                            line: i
                        });
                        headRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                            fieldId: 'custrecord_sii_custpayment_link',
                            value: customerPaymentRecordId
                        });
                        headRecord.commitLine({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                        });
                    }else{
                        var invoiceDetailsList = getInvoiceList();
                        var customerPaymentRecord  = null;
                        var j =0;
                        invoiceDetailsList.each(function(result) {
                            var invoiceCustomer = result.getValue(invoiceDetailsList.columns[0]);
                            var tranid = result.getValue(invoiceDetailsList.columns[2]);
                            var duedate = result.getValue(invoiceDetailsList.columns[7]);
                            var amount = result.getValue(invoiceDetailsList.columns[3]);
                            var amountremaining = result.getValue(invoiceDetailsList.columns[4]);
                            var department = result.getValue(invoiceDetailsList.columns[6]);
                            var entity = result.getValue(invoiceDetailsList.columns[8]);
                            var saleseffectivedate = result.getValue(invoiceDetailsList.columns[9]);
                            if(invoiceCustomer === client ){
                                var applied = 0;
                                if(paymentamo < amountremaining){
                                    applied = parseInt(paymentamo);
                                    paymentamo = 0;
                                }else{
                                    applied = parseInt(amountremaining);
                                    paymentamo = paymentamo - amountremaining;
                                }
                                if(j == 0 && applied != 0){
                                    customerPaymentRecord = record.transform({
                                        fromType: 'invoice',
                                        fromId: result.id,
                                        toType: 'customerpayment'
                                    });
                                    if(!isEmpty(department)){
                                        customerPaymentRecord.setValue({
                                            fieldId: 'department',
                                            value: department
                                        });
                                    }
                                    if(!isEmpty(client_half)){
                                        customerPaymentRecord.setValue({
                                            fieldId: 'custbody_hankakukana_name',
                                            value: client_half
                                        });
                                    }
                                    customerPaymentRecord.setValue({
                                        fieldId: 'account',
                                        value: accountId
                                    });
                                }
                                var invoiceRecord = record.load({
                                    type: 'invoice',
                                    id: result.id
                                });
                                if(applied != 0){
                                    customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'internalid',
                                        line: j,
                                        value: result.id
                                    });
                                    customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'amount',
                                        line: j,
                                        value: applied
                                    });
                                    customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'applydate',
                                        line: j,
                                        value: invoiceRecord.getValue({fieldId: 'saleseffectivedate'})
                                    });
                                    customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'apply',
                                        line: j,
                                        value: true
                                    });
                                    j++;
                                }
                            }
                            return true;
                        });
                        if(!isEmpty(customerPaymentRecord)){
                            customerPaymentRecordId = customerPaymentRecord.save();
                            var lineNum = headRecord.selectLine({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                line: i
                            });
                            headRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_link',
                                value: customerPaymentRecordId
                            });
                            headRecord.commitLine({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                            });
                        }
                        var journalId = createJournal(saveAcc,client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo);
                        if(journalId != 0){
                            var lineNum = headRecord.selectLine({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                line: i
                            });
                            headRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_link_jou',
                                value: journalId
                            });
                            headRecord.commitLine({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                            });
                        }
                    }
                }else{
                    var invoiceDetailsList = getInvoiceList();
                    var customerPaymentRecord  = null;
                    var j =0;
                    invoiceDetailsList.each(function(result) {
                        var invoiceCustomer = result.getValue(invoiceDetailsList.columns[0]);
                        var tranid = result.getValue(invoiceDetailsList.columns[2]);
                        var duedate = result.getValue(invoiceDetailsList.columns[7]);
                        var amount = result.getValue(invoiceDetailsList.columns[3]);
                        var amountremaining = result.getValue(invoiceDetailsList.columns[4]);
                        var department = result.getValue(invoiceDetailsList.columns[6]);
                        var entity = result.getValue(invoiceDetailsList.columns[8]);
                        var saleseffectivedate = result.getValue(invoiceDetailsList.columns[9]);
                        if(invoiceCustomer === client ){
                            var applied = 0;
                            if(paymentamo < amountremaining){
                                applied = parseInt(paymentamo);
                                paymentamo = 0;
                            }else{
                                applied = parseInt(amountremaining);
                                paymentamo = paymentamo - amountremaining;
                            }
                            if(j == 0 && applied != 0){
                                customerPaymentRecord = record.transform({
                                    fromType: 'invoice',
                                    fromId: result.id,
                                    toType: 'customerpayment'
                                });
                                if(!isEmpty(department)){
                                    customerPaymentRecord.setValue({
                                        fieldId: 'department',
                                        value: department
                                    });
                                }
                                if(!isEmpty(client_half)){
                                    customerPaymentRecord.setValue({
                                        fieldId: 'custbody_hankakukana_name',
                                        value: client_half
                                    });
                                }
                                customerPaymentRecord.setValue({
                                    fieldId: 'account',
                                    value: accountId
                                });
                            }
                            var invoiceRecord = record.load({
                                type: 'invoice',
                                id: result.id
                            });
                            if(applied != 0){
                                customerPaymentRecord.setSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'internalid',
                                    line: j,
                                    value: result.id
                                });
                                customerPaymentRecord.setSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'amount',
                                    line: j,
                                    value: applied
                                });
                                customerPaymentRecord.setSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'applydate',
                                    line: j,
                                    value: invoiceRecord.getValue({fieldId: 'saleseffectivedate'})
                                });
                                customerPaymentRecord.setSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'apply',
                                    line: j,
                                    value: true
                                });
                                j++;
                            }
                        }
                        return true;
                    });
                    if(!isEmpty(customerPaymentRecord)){
                        customerPaymentRecordId = customerPaymentRecord.save();
                        var lineNum = headRecord.selectLine({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                            line: i
                        });
                        headRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                            fieldId: 'custrecord_sii_custpayment_link',
                            value: customerPaymentRecordId
                        });
                        headRecord.commitLine({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                        });
                    }
                    var journalId = createJournal(saveAcc,client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo);
                    if(journalId != 0){
                        var lineNum = headRecord.selectLine({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                            line: i
                        });
                        headRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                            fieldId: 'custrecord_sii_custpayment_link_jou',
                            value: journalId
                        });
                        headRecord.commitLine({
                            sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                        });
                    }
                }
            }
        }
        headRecord.setValue({
            fieldId: 'custrecord_sii_custpayment_status',
            value:  4
        });
        headRecord.save();
        return true;
      }catch(e){
        var headRecord = record.load({
            type : 'customrecord_sii_custpayment_h',
            id : id
        });
        headRecord.setValue({
            fieldId: 'custrecord_sii_custpayment_status',
            value:  5
        });
        headRecord.save();
        log.error({
          title: e.name,
          details: e.message
        });
        return false;
      }
    }

    function createJournal(invoiceAccount, client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo){
        var nowDate = new Date();
        var newJournalRecord = record.create({
            type: 'journalentry'
        });
        var id;
        if(isEmpty(feeSum)){
            if(isEmpty(erorrParam)){
                return 0;
            }else{
                var nowDate = new Date();
                var newJournalRecord = record.create({
                    type: 'journalentry'
                });
                /*newJournalRecord.setValue({
                  fieldId: 'trandate',
                  value: nowDate
                });*/
                newJournalRecord.setValue({
                  fieldId: 'currency',
                  value: 1
                });
                newJournalRecord.setValue({
                  fieldId: 'exchangerate',
                  value: 1
                });
                newJournalRecord.setValue({
                  fieldId: 'subsidiary',
                  value: 1
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 0,
                  value: savePlus
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 0,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'credit',
                  line: 0,
                  value: erorrParam
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 1,
                  value: saveAcc
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 1,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'debit',
                  line: 1,
                  value: erorrParam
                });
                id = newJournalRecord.save();
            }
        }else{
            if(!isEmpty(erorrParam)){
                /*newJournalRecord.setValue({
                  fieldId: 'trandate',
                  value: nowDate
                });*/
                newJournalRecord.setValue({
                  fieldId: 'currency',
                  value: 1
                });
                newJournalRecord.setValue({
                  fieldId: 'exchangerate',
                  value: 1
                });
                newJournalRecord.setValue({
                  fieldId: 'subsidiary',
                  value: 1
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 0,
                  value: invoiceAccount
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 0,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'credit',
                  line: 0,
                  value: parseInt(feeSum)+parseInt(erorrParam)
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 1,
                  value: savePlus
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 1,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'debit',
                  line: 1,
                  value: erorrParam
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 2,
                  value: saveAcc
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 2,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'debit',
                  line: 2,
                  value: feeBase
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'grossamt',
                  line: 2,
                  value: feeSum
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'tax1acct',
                  line: 2,
                  value: 224
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'tax1amt',
                  line: 2,
                  value: feeSum - feeBase
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'taxcode',
                  line: 2,
                  value: saveTaxCo
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'taxrate1',
                  line: 2,
                  value: 8
                });
                id = newJournalRecord.save();
            }else{
                /*newJournalRecord.setValue({
                  fieldId: 'trandate',
                  value: nowDate
                });*/
                newJournalRecord.setValue({
                  fieldId: 'currency',
                  value: 1
                });
                newJournalRecord.setValue({
                  fieldId: 'exchangerate',
                  value: 1
                });
                newJournalRecord.setValue({
                  fieldId: 'subsidiary',
                  value: 1
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 0,
                  value: invoiceAccount
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 0,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'credit',
                  line: 0,
                  value: feeSum
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'account',
                  line: 1,
                  value: saveAcc
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'entity',
                  line: 1,
                  value: client
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'debit',
                  line: 1,
                  value: feeBase
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'grossamt',
                  line: 1,
                  value: feeSum
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'tax1acct',
                  line: 1,
                  value: 224
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'tax1amt',
                  line: 1,
                  value: feeSum - feeBase
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'taxcode',
                  line: 1,
                  value: saveTaxCo
                });
                newJournalRecord.setSublistValue({
                  sublistId: 'line',
                  fieldId: 'taxrate1',
                  line: 1,
                  value: 8
                });
                id = newJournalRecord.save();
            }
        }
        return( id );
    }
    function getPaymentList(paymentListHeadId){
      var myPaymentListSearch = search.create({
        type: 'customrecord_sii_custpayment',
        columns: [{
          name: 'custrecord_sii_custpayment_depositnum',
          sort: search.Sort.ASC
        }, {
          name: 'custrecord_sii_custpayment_exclusion'
        }, {
          name: 'custrecord_sii_custpayment_depositacc'
        }, {
          name: 'custrecord_sii_custpayment_customerno'
        }, {
          name: 'custrecord_sii_custpayment_client'
        }, {
          name: 'custrecord_sii_custpayment_paymentdate'
        },{
          name: 'custrecord_sii_custpayment_bank'
        },{
          name: 'custrecord_sii_custpayment_branchoff'
        },{
          name: 'custrecord_sii_custpayment_request'
        },{
          name: 'custrecord_sii_custpayment_paymentamo'
        },{
          name: 'custrecord_sii_custpayment_claimsum'
        },{
          name: 'custrecord_sii_custpayment_match'
        },{
          name: 'custrecord_sii_custpayment_consumption'
        },{
          name: 'custrecord_sii_custpayment_fee'
        },{
          name: 'custrecord_sii_custpayment_client_half'
        }],
        filters: [{
          name: 'custrecord_sii_custpayment_h_id',
          operator: search.Operator.IS,
          values: [paymentListHeadId]
        }]
      });
      var resultSet = myPaymentListSearch.run();
      return( myPaymentListSearch.run() );
    }

    function getSetting(){
      var mysearch = search.create({
        type: 'customrecord_sii_custpayment_setting',
        columns: [{
          name: 'custrecord_sii_custpayment_setting_acc'
        },{
          name: 'custrecord_sii_custpayment_setting_taxco'
        },{
          name: 'custrecord_sii_custpayment_setting_taxca'
        },{
          name: 'custrecord_sii_custpayment_setting_error'
        },{
          name: 'custrecord_sii_custpayment_setting_plus'
        },{
          name: 'custrecord_sii_custpayment_setting_minus'
        }]
      });
      var resultSet = mysearch.run();
      return( resultSet );
    }

    function getInvoice(){
      var mysearch = search.load({
        id: 'customsearch_sii_custpayment_invoice'
      });
      var resultSet = mysearch.run();
      return( resultSet );
    }

    function getInt(stringNumber){
      stringNumber = stringNumber.split(",");
      var stringtotal = '';
      stringNumber.forEach(function(item, index){
        stringtotal = stringtotal+item;
      });
      stringNumber = parseInt(stringtotal);
      return stringNumber;
    }

    function getFee(){
      var mysearch = search.create({
        type: 'customrecord_sii_custfee',
        columns: [{
          name: 'name'
        },{
          name: 'custrecord_sii_custfee_sum'
        },
        {
          name: 'custrecord_sii_custfee_base'
        }]
      });
      var resultSet = mysearch.run();
      return( resultSet );
    }

    function getInvoiceList(){
        var mysearch = search.load({
          id: 'customsearch_custpayment_invoice_detail'
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function isEmpty(stValue) {
      if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
        return true;
      } else {
        return false;
      }
    }
    
    function getNowDateJP(){
        var stNow = new Date();
        stNow.setMilliseconds((3600000*9));
        var stYear = stNow.getUTCFullYear();
        var stMonth = stNow.getUTCMonth();
        var stDate = stNow.getUTCDate();
        stNow = new Date(stYear,stMonth,stDate);
        return stNow;
    }

    return {
      execute: execute
    };
});