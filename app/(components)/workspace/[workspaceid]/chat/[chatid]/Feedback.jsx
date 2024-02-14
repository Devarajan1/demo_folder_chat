import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../../../components/ui/dialog';
import Image from 'next/image';
import { useToast } from '../../../../../../components/ui/use-toast';
import { Button } from '../../../../../../components/ui/button';
import thumbsDownIconGray from '../../../../../../public/assets/thumbs-down.svg'
import thumbsUpIconGray from '../../../../../../public/assets/thumbs-up.svg'

const Feedback = ({ msgID }) => {


    const [feedback, setFeedback] = useState(true)
    const [open, setOpen] = useState(false)
    const { toast } = useToast();

    const [feedbackInput, setFeedbackInput] = useState({
        "chat_message_id": msgID,
        "is_positive": feedback,
        "feedback_text": ""
    });
    async function sendUserFeedback() {
        // console.log(alt, msgID)
        // return 
        try {
            const response = await fetch('/api/chat/create-chat-message-feedback', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(feedbackInput)
            });
            if (response?.ok) {
                setOpen(false)
                return toast({
                    variant: 'default',
                    title: "Thanks for your feedback!"
                });
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} className='w-fit border'>
            <DialogTrigger asChild className='w-6 h-6 hover:cursor-pointer hover:bg-slate-100 ml-0 rounded-sm'>
                <div className='w-10 h-4 p-1 flex'>
                    <Image src={thumbsUpIconGray} alt="like" className="mr-4" onClick={() => setFeedback(true)} />
                    <Image src={thumbsDownIconGray} alt="dislike" onClick={() => setFeedback(false)} />
                </div>
            </DialogTrigger>

            <DialogContent className='w-full flex flex-col item-center justify-center p-8'>
                <DialogHeader>
                    <DialogTitle>Provide additional feedback </DialogTitle>
                </DialogHeader>
                <textarea rows={3} className='p-2 border' placeholder={feedback ? 'What did you like about this response?' : 'What was the issue with response? How could it be improved?'} onChange={(e) => setFeedbackInput({
                    ...feedbackInput,
                    "feedback_text": e.target.value
                })}
                />
                <DialogFooter className='w-full flex item-center justify-center'>
                    <Button className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-80 w-[25%]' onClick={sendUserFeedback}>Submit</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}

export default Feedback