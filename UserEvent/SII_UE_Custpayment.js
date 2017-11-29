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
    	/*try{
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
    	}*/
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
            if (scriptContext.type == scriptContext.UserEventType.CREATE){
                var customerRecord = scriptContext.newRecord;
                var bank = customerRecord.getValue('custrecord_sii_custpayment_bank');
                var branchoff = customerRecord.getValue('custrecord_sii_custpayment_branchoff');
                var request = customerRecord.getValue('custrecord_sii_custpayment_request');
                var mysearch = search.create({
                    type: search.Type.CUSTOMER,
                    filters: [{
                        name: 'custentity_sii_custpayment_bankname',
                        operator: 'is',
                        values: [bank]
                    },{
                        name: 'custentity_sii_custpayment_branchname',
                        operator: 'is',
                        values: [branchoff]
                    },{
                        name: 'custentity_sii_custpayment_clientname',
                        operator: 'is',
                        values: [request]
                    }],
                    columns: [{
                        name: 'entityid'
                    }]
                });
                var resultSet = mysearch.run();
                var results = resultSet.getRange({
                    start: 0,
                    end: 1
                });
                if(results.length !== 0){
                    customerRecord.setValue({
                        fieldId: 'custrecord_sii_custpayment_client',
                        value: results[0].id
                    }); 
                }    
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
    function afterSubmit(scriptContext) {
    	/*try{
    		if (scriptContext.type == scriptContext.UserEventType.CREATE){
    			var customerRecord = scriptContext.newRecord;
                customerRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_bank',
                    value: '1000'
                });
                customerRecord.save();
                log.debug(customerRecord.getValue('custrecord_sii_custpayment_bank'))  			
    		}
    	}catch(e){
    		log.error('UE: ' + e.name);
    	}*/
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
