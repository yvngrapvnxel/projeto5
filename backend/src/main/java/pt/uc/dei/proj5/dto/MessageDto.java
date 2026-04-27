package pt.uc.dei.proj5.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

@XmlRootElement
public class MessageDto implements Serializable {

    private Long sender;
    private Long receiver;
    private String text;

    public MessageDto() {}

    public MessageDto(Long sender, Long receiver, String text) {
        this.sender = sender;
        this.receiver = receiver;
        this.text = text;
    }

    @XmlElement
    public Long getSender() { return sender; }

    public void setSender(Long sender) { this.sender = sender; }

    @XmlElement
    public Long getReceiver() { return receiver; }

    public void setReceiver(Long receiver) { this.receiver = receiver; }

    @XmlElement
    public String getText() { return text; }

    public void setText(String text) { this.text = text; }
}