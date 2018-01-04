/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format', 'N/runtime', 'N/url', 'N/task'],

function(serverWidget, http, record, search, redirect, format, runtime, url, task) {
   
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
            var request = context.request;
            var recordId = request.parameters.custscript_custpayment_head_id;
            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            scriptTask.scriptId = 'customscript_sii_ss_create_journal_custp';
            scriptTask.deploymentId = 'customdeploy_sii_ss_create_journal_custp';
            scriptTask.params = {custscripthead_id: recordId};
            var scriptTaskId = scriptTask.submit();
            var taskStatus = task.checkStatus(scriptTaskId);
            log.debug({
                title: 'taskStatus',
                details: taskStatus
            });
            redirect.toRecord({
                type : 'customrecord_sii_custpayment_h',
                id : recordId,
                parameters: {'custscript_check_message': true}
            });
            /*var scriptObj = runtime.getCurrentScript();
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
                var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                scriptTask.scriptId = 'customscript_sii_ss_create_journal_custp';
                scriptTask.deploymentId = 'customdeploy_sii_ss_create_journal_custp';
                scriptTask.params = {custscripthead_id: id};
                var scriptTaskId = scriptTask.submit();
                redirect.toRecord({
                    type : 'customrecord_sii_custpayment_h',
                    id : id
                });
            }      */
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    function createJournal(invoiceAccount, client, erorrParam, savePlus, saveAcc, feeSum, feeBase, saveTaxCo){
        var nowDate = new Date();
        var newJournalRecord = record.create({
            type: 'journalentry'
        });
        var id;
        if(!!isEmpty(erorrParam)){
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
            /*newJournalRecord.setSublistValue({
                sublistId: 'line',
                fieldId: 'grossamt',
                line: 1,
                value: erorrParam
            });*/
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
