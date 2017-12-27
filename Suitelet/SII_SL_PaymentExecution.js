/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format', 'N/runtime', 'N/url'],

function(serverWidget, http, record, search, redirect, format, runtime, url) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try{
            var scriptObj = runtime.getCurrentScript();
            var request = context.request;
            var recordId = request.parameters.custscript_custpayment_head_id;
            if (request.method === http.Method.GET) {
                // フォーム定義
                var form = serverWidget.createForm({
                    title: '入金管実行'
                });
                form.addSubmitButton({
                    label: '実行'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: 'キャンセル',
                    functionName: 'window.history.go(-1);'
                });
                var head_id = form.addField({
                    id: 'head_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                head_id.defaultValue = recordId;
                context.response.writePage(form);
            }else{
                var id = context.request.parameters.head_id;
                var headRecord = record.load({
                    type : 'customrecord_sii_custpayment_h',
                    id : id
                });
                var nowDate = new Date();
                var numLines = headRecord.getLineCount({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                });
                var feeList = getFee();
                for(var i = 0; i < numLines; i++ ){
                    var entityid = headRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_client',
                        line: i
                    });
                    var saving = headRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_saving',
                        line: i
                    });
                    if(saving != '' && saving != null){
                        saving = JSON.parse(saving);
                        if(saving.invoice != '' && saving.invoice != null){
                            invoicesArray = saving.invoice;
                            var customerPaymentRecord = record.transform({
                                fromType: 'invoice',
                                fromId: invoicesArray[0].id,
                                toType: 'customerpayment'
                            });
                            var sum = 0;
                            if(invoicesArray[0].check == 'T'){
                                sum = invoicesArray[0].applied
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
                                    fieldId: 'amount',
                                    line: j,
                                    value: invoiceRecord.getValue({fieldId: 'total'})
                                });
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
                                    sum += invoiceRecord.getValue({fieldId: 'total'})
                                }
                            }
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
                            var subsidiary = newJournalRecord.getValue({
                                fieldId: 'subsidiary',
                                value: 1
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                line: 0,
                                value: 332
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                line: 0,
                                value: 230
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                line: 0,
                                value: 540
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                line: 1,
                                value: 330
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                line: 1,
                                value: 230
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                line: 1,
                                value: 500
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'grossamt',
                                line: 1,
                                value: 540
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
                                value: 40
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'taxcode',
                                line: 1,
                                value: 18
                            });
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'taxrate1',
                                line: 1,
                                value: 8
                            });
                            newJournalRecord.save();
                            /*customerPaymentRecord.setValue({
                                fieldId: 'payment',
                                value: sum
                            })*/
                            customerPaymentRecordId = customerPaymentRecord.save();
                        }
                    }
                }
                /*
                var newJournalRecord = record.create({
                    type: 'journalentry'
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 0,
                    value: 330
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    line: 0,
                    value: 230
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 0,
                    value: 540
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: 332
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    line: 1,
                    value: 230
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 1,
                    value: 500
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'tax1amt',
                    line: 1,
                    value: 40
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'taxrate1',
                    line: 1,
                    value: 8
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'grossamt',
                    line: 1,
                    value: 540
                });
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'tax1acct',
                    line: 1,
                    value: 224
                });
                newJournalRecord.save();*/
                redirect.toRecord({
                    type : 'customrecord_sii_custpayment_h',
                    id : id
                });
            }      
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
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

    function checkDate(paymentDate, fromDate, toDate){
        if(!isEmpty(fromDate)){
            if(!isEmpty(toDate)){
                if(paymentDate >= fromDate && paymentDate <= toDate){
                    return true;
                }else{
                    return false;
                }
            }else{
                if(paymentDate >= fromDate){
                    return true;
                }else{
                    return false;
                }
            }
        }else{
            if(!isEmpty(toDate)){
                if(paymentDate <= toDate){
                    return true;
                }else{
                    return false;
                }
            }else{
                if(paymentDate >= fromDate){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }

    function isEmpty(stValue) {
            if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
                return true;
            } else {
                return false;
            }
        }

    return {
        onRequest: onRequest
    };
    
});
