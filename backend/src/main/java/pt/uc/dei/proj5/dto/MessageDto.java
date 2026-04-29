package pt.uc.dei.proj5.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

@XmlRootElement
public class MessageDto implements Serializable {

    private Long sender;
    private Long receiver;
    private String text;
    private String timestamp;
    private boolean isRead;
    private String type;

    public MessageDto() {}

    public MessageDto(Long sender, Long receiver, String text, String timestamp, boolean isRead) {
        this.sender = sender;
        this.receiver = receiver;
        this.text = text;
        this.timestamp = timestamp;
        this.isRead = isRead;
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

    @XmlElement
    public String getTimestamp() { return timestamp; }

    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    @XmlElement
    public boolean isRead() { return isRead; }

    public void setRead(boolean read) { this.isRead = read; }

    @XmlElement
    public String getType() { return type; }

    public void setType(String type) { this.type = type; }
}