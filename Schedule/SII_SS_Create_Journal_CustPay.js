/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/record', 'N/runtime'],
  function(search, record, runtime) {
    function execute(context) {
      var id = runtime.getCurrentScript().getParameter("custscripthead_id");
      try{
        log.debug({
          title: 'Create record',
          details: 'Create start '+id
        });
        //var id = context.parameters.head_id;
        var headRecord = record.load({
            type : 'customrecord_sii_custpayment_h',
            id : id
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
        var nowDate = new Date();
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
                        value: 4
                    });
                    var sum = 0;
                    if(invoicesArray[0].check == 'T'){
                        sum = invoicesArray[0].applied
                    }
                    if(invoicesArray[0].check_2 == 'T'){
                        /*customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'amount',
                            line: 0,
                            value: paymentamo
                        });*/
                        var invoiceRecord = record.load({
                            type: 'invoice',
                            id: invoicesArray[0].id
                        })
                        var invoiceAccount = invoiceRecord.getValue({fieldId: 'account'})
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'disc',
                            line: 0,
                            value: feeSum
                        });
                        var journalId = createJournal(invoiceAccount, client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo);
                        log.debug({
                            title: 'journalId',
                            details: journalId
                        });
                    }
                    for(var j =1; j < invoicesArray.length; j++){
                        var invoiceRecord = record.load({
                            type: 'invoice',
                            id: invoicesArray[j].id
                        })
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: j,
                            value: invoiceRecord.id
                        })
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'applydate',
                            line: j,
                            value: invoiceRecord.getValue({fieldId: 'saleseffectivedate'})
                        });
                        if(invoicesArray[j].check == 'T'){
                            customerPaymentRecord.setSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                line: j,
                                value: true
                            })
                        }
                        if(invoicesArray[j].check_2 == 'T'){
                            if(fee){
                                if(consumption){
                                    var erorr = claimsum - paymentamo;
                                    customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'disc',
                                        line: j,
                                        value: erorr
                                    });
                                }else{
                                    customerPaymentRecord.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'disc',
                                        line: j,
                                        value: feeSum
                                    });
                                }
                            }
                            var invoiceAccount = invoiceRecord.getValue({fieldId: 'account'});
                            var journalId = createJournal(invoiceAccount,client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo);
                        }
                    }
                    customerPaymentRecordId = customerPaymentRecord.save();
                }else{

                }
            }else{
              var invoiceDetailsList = getInvoiceList();
              var customerPaymentRecord;
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
                        if(j == 0){
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
                            value: 4
                          });
                        }else{
                          var invoiceRecord = record.load({
                            type: 'invoice',
                            id: result.id
                          })
                          customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: j,
                            value: result.id
                          });
                          /*customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'amount',
                            line: j,
                            value: amountremaining
                          });
*/                          customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'applydate',
                            line: j,
                            value: invoiceRecord.getValue({fieldId: 'saleseffectivedate'})
                          });
                        }
                        if(applied != 0){
                            customerPaymentRecord.setSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                line: j,
                                value: true
                            })
                        }
                        j++;
                    }
                    return true;
                });
              if(!isEmpty(customerPaymentRecord)){
                customerPaymentRecordId = customerPaymentRecord.save();
              }
              var journalId = createJournal(saveAcc,client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo);
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
                erorrParam = 0;
            }
            var nowDate = new Date();
            var newJournalRecord = record.create({
                type: 'journalentry'
            });
            newJournalRecord.setValue({
              fieldId: 'trandate',
              value: nowDate
            });
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
        }else{
            if(!isEmpty(erorrParam)){
                newJournalRecord.setValue({
                  fieldId: 'trandate',
                  value: nowDate
                });
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
                newJournalRecord.setValue({
                  fieldId: 'trandate',
                  value: nowDate
                });
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
    return {
      execute: execute
    };
});