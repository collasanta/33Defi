import React from 'react'

const styles = {
    modaly: `fixed left-0 bottom-0 top-[-350px] right-[-765px] flex items-center justify-center `,
    modalcontent: `bg-[#ffffff] ml-[10px] w-[260px] px-[15px] py-[20px] bg-[#edeef2] border-[1px] border-[#ced0d9] rounded-2xl `,
    modalbody: `pl-[30px]`,
    titleheader: `ml-[-20px] text-[#565a69]`,
    labelfield: ` text-[16px] text-[#565a69]`,
    labelcontainer: `pt-[15px]`,
    fieldcontainer: `pl-[0px]`,
    inputfield: `pl-[10px] rounded-[36px] text-[15px] mx-[-5px] h-[2rem] w-[50%] my-[2px]  `,
    inputFieldUnits: `pl-[10px] text-[#565a69] text-[15px]`,
}


const ConfigModal = (props: { onClose: React.MouseEventHandler<HTMLDivElement> | undefined; slippageAmount: string | number | readonly string[] | undefined; setSlippageAmount: (arg0: string) => void; deadlineMinutes: string | number | readonly string[] | undefined; setDeadlineMinutes: (arg0: string) => void }) => {
  return (
    <div className={styles.modaly} onClick={props.onClose}>
        <div className={styles.modalcontent} onClick={e=> e.stopPropagation()}>
            <div className={styles.modalbody}>                            
                <h4 className={styles.titleheader}>Transaction Settings</h4>

                <div className={styles.labelcontainer}>
                    <label className={styles.labelfield}>Slippage Tolerance</label>
                </div>
                <div>
                    <div className={styles.inputfield}>
                        <input
                          className={styles.inputfield}
                          placeholder='1.0'
                          value={props.slippageAmount}
                          onChange={e => props.setSlippageAmount(e.target.value)}
                        >
                        </input>
                        <span className={styles.inputFieldUnits}>%</span>
                    </div>

                </div>

                <div className={styles.labelcontainer}>
                    <label className={styles.labelfield}>Transaction Deadline</label>
                </div>

                <div>
                    <div className={styles.inputfield}>
                        <input
                            className={styles.inputfield}
                            placeholder='10'
                            value={props.deadlineMinutes}
                            onChange={e => props.setDeadlineMinutes(e.target.value)}
                            >
                        </input>
                        <span className={styles.inputFieldUnits}>min</span>
                    </div>
                </div>
            </div>    
       </div>
    </div>
  )
}

export default ConfigModal