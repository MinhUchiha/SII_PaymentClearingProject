/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/url','N/runtime','N/record', 'N/redirect', 'N/search'],

function(serverWidget,url,runtime,record, redirect, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	try{
    		if (scriptContext.type === scriptContext.UserEventType.EDIT){
    		    var currentRecord = scriptContext.newRecord;
    		    //log.debug('Record: ' + currentRecord.id);
    			redirect.toSuitelet({
    				scriptId: 'customscript_sii_sl_paymentmanagement' ,
    				deploymentId: 'customdeploy_sii_sl_paymentmanagement',
    				parameters: {'custscript_custpayment_head_id': currentRecord.id}
    			});
    		}
    	}catch(e){
    		log.error('UE: ' + e.name);
    	}
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
        try{
            if (scriptContext.type === scriptContext.UserEventType.CREATE){
                var currentRecord = scriptContext.newRecord;
                var customerArray = getCustomer()
                var numLines = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                });
                for(var i = 0; i < numLines; i++){
                    var bank = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_bank',
                        line: i
                    });
                    var branchname = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_branchoff',
                        line: i
                    });
                    var request = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_request',
                        line: i
                    });
                    for(var m =0; m < customerArray.length; m++){
                        var custbankname = customerArray[m].getValue({name: 'custentity_sii_custpayment_bankname'}); 
                        var custbranchname = customerArray[m].getValue({name: 'custentity_sii_custpayment_branchname'});
                        var custclientname = customerArray[m].getValue({name: 'custentity_sii_custpayment_clientname'});
                        var entityid = customerArray[m].getValue({name: 'entityid'});
                        if(custbankname == bank && custbranchname == branchname && custclientname == request ){
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_customerno',
                                value: entityid,
                                line: i
                            });
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_client',
                                value: customerArray[m].id,
                                line: i
                            });
                            break;
                        } 
                    }
                }
                var scriptObj = runtime.getCurrentScript();
                log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
            }
        }catch(e){
            log.error('UE: ' + e);
        }
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
 
    }

    function getCustomer(){
        var SLICE_LIMIT = 1000;
        var myCustomerListSearch = search.create({
            type: search.Type.CUSTOMER,
            columns: [{
                name: 'entityid'
            }, {
                name: 'custentity_sii_custpayment_bankname'
            }, {
                name: 'custentity_sii_custpayment_branchname'
            }, {
                name: 'custentity_sii_custpayment_clientname'
            }]
        });
        var resultSet = myCustomerListSearch.run();
        var customerArray = resultSet.getRange({
            start: 0,
            end: SLICE_LIMIT
        });
        return( customerArray );
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
